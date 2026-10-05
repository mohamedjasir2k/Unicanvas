import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const openRouterKey = process.env.OPENROUTER_API_KEY;

console.log(
    "OPENROUTER_API_KEY loaded:",
    Boolean(openRouterKey),
    "length:",
    openRouterKey?.length || 0
);

const openai =
    new OpenAI({
        apiKey: openRouterKey,
        baseURL: "https://openrouter.ai/api/v1"
    });

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


app.post("/api/chat", async (req, res) => {

    try {

        const messages =
            Array.isArray(req.body.messages)
                ? req.body.messages
                : [];

        const safeMessages =
            messages.slice(-12);

        const response =
            await openai.responses.create({

                model: "gpt-5.6-luna",

                instructions: `
You are Uni, the AI assistant inside UniCanvas.

UniCanvas is a creative project-building workspace.

Your job is to help users:
- brainstorm project ideas
- research and understand topics
- develop ideas
- write and improve content
- create presentations and outlines
- solve problems
- explain difficult concepts simply
- plan projects
- generate creative suggestions

Be natural and conversational.

Do not use the same response repeatedly.
Do not give generic advice when the user asks a specific question.
Answer the actual question first.

If the user asks your name, say that your name is Uni and that you are the AI assistant inside UniCanvas.

If the user says hello or hi, respond naturally.

If the user asks for something creative, actually create it rather than merely explaining how to create it.

Keep answers appropriate for a school project environment.

Do not claim to have performed actions you cannot actually perform.
`,

                input: safeMessages

            });

        res.json({
            reply:
                response.output_text
        });

    } catch (error) {

        console.error(
            "OpenAI error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to connect to UniCanvas AI."
        });
    }
});


const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    () => {
        console.log(
            `UniCanvas running on port ${PORT}`
        );
    }
);