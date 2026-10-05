import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openRouterKey =
    process.env.OPENROUTER_API_KEY?.trim();

console.log(
    "OPENROUTER_API_KEY loaded:",
    Boolean(openRouterKey),
    "length:",
    openRouterKey?.length || 0
);

app.use(express.json());

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "INDEX.html")
    );
});

app.post("/api/chat", async (req, res) => {

    try {

        const messages =
            Array.isArray(req.body?.messages)
                ? req.body.messages.slice(-12)
                : [];

        const response =
            await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${openRouterKey}`,

                        "Content-Type":
                            "application/json",

                        "HTTP-Referer":
                            "https://unicanvas.onrender.com",

                        "X-Title":
                            "UniCanvas"
                    },

                    body: JSON.stringify({

                        model:
                            "openrouter/free",

                        messages: [

                            {
                                role: "system",

                                content: `
You are Uni, the AI assistant inside UniCanvas.

UniCanvas is a creative project-building workspace.

Help users with:
- brainstorming
- research
- understanding topics
- developing ideas
- writing
- presentations
- problem solving
- explanations
- project planning
- creative suggestions

Be natural and conversational.

Answer the user's actual question first.

Do not give generic advice when a specific answer is possible.

If the user asks your name, say your name is Uni and that you are the AI assistant inside UniCanvas.

If the user says hello or hi, respond naturally.

If the user asks for something creative, actually create it.

Keep answers appropriate for a school project environment.

Do not claim to have performed actions you cannot perform.
`
                            },

                            ...messages

                        ]

                    })

                }
            );

        const data =
            await response.json();

        console.log(
            "OpenRouter status:",
            response.status
        );

        if (!response.ok) {

            console.error(
                "OpenRouter API error:",
                data
            );

            return res.status(
                response.status
            ).json({

                error:
                    data?.error?.message ||
                    "OpenRouter request failed."

            });

        }

        const reply =
            data?.choices?.[0]?.message?.content ||
            "I couldn't generate a response.";

        res.json({
            reply: reply
        });

    } catch (error) {

        console.error(
            "UniCanvas AI error:",
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
    "0.0.0.0",
    () => {

        console.log(
            `UniCanvas running on port ${PORT}`
        );

    }
);