import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import uniKnowledge from "./uniKnowledge.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "INDEX.html"));
});

function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function findKnowledgeAnswer(userMessage) {
    const user = normalize(userMessage);

    if (!user) return null;

    for (const item of uniKnowledge) {
        const question = normalize(item.question);

        if (
            question === user ||
            user.includes(question) ||
            question.includes(user)
        ) {
            return item.answer;
        }
    }

    const userWords = user
        .split(" ")
        .filter(word => word.length >= 4);

    let bestMatch = null;
    let bestScore = 0;

    for (const item of uniKnowledge) {
        const questionWords = normalize(item.question)
            .split(" ")
            .filter(word => word.length >= 4);

        let score = 0;

        for (const word of userWords) {
            if (questionWords.includes(word)) {
                score++;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }

    if (bestMatch && bestScore >= 2) {
        return bestMatch.answer;
    }

    return null;
}

app.post("/api/chat", (req, res) => {

    try {

        const messages = Array.isArray(req.body?.messages)
            ? req.body.messages
            : [];

        const userMessage =
            messages[messages.length - 1]?.content || "";

        const answer =
            findKnowledgeAnswer(userMessage);

        if (answer) {

            return res.json({
                reply: Array.isArray(answer)
                    ? answer.join("\n")
                    : String(answer)
            });

        }

        return res.json({
            reply:
                "I don't have an answer for that yet. Try asking me about projects, research, creativity, ideas, motivation, or UniCanvas."
        });

    } catch (error) {

        console.error("UniCanvas error:", error);

        return res.status(500).json({
            error: "Unable to process your question."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`UniCanvas running on port ${PORT}`);
});