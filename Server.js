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

    const normalizedUserMessage =
        normalize(userMessage);

    if (!normalizedUserMessage) {
        return null;
    }

    // 1. Exact / contained match
    const exactMatch =
        uniKnowledge.find(item => {

            const question =
                normalize(item.question);

            return (
                question === normalizedUserMessage ||
                normalizedUserMessage.includes(question) ||
                question.includes(normalizedUserMessage)
            );

        });

    if (exactMatch) {
        return exactMatch.answer;
    }

    // 2. Remove common question words
    const stopWords = new Set([
        "what",
        "how",
        "can",
        "could",
        "would",
        "should",
        "do",
        "does",
        "did",
        "is",
        "are",
        "the",
        "a",
        "an",
        "me",
        "i",
        "my",
        "you",
        "your",
        "please",
        "think",
        "tell",
        "give",
        "help",
        "want",
        "need",
        "to"
    ]);

    const userWords =
        normalizedUserMessage
            .split(" ")
            .filter(word =>
                word.length >= 3 &&
                !stopWords.has(word)
            );

    let bestMatch = null;
    let bestScore = 0;

    // 3. Compare meaningful words
    for (const item of uniKnowledge) {

        const question =
            normalize(item.question);

        const questionWords =
            question
                .split(" ")
                .filter(word =>
                    word.length >= 3 &&
                    !stopWords.has(word)
                );

        let score = 0;

        for (const userWord of userWords) {

            for (const questionWord of questionWords) {

                // Exact word
                if (userWord === questionWord) {
                    score += 2;
                }

                // Similar word
                else if (
                    userWord.length >= 5 &&
                    questionWord.length >= 5 &&
                    (
                        userWord.includes(questionWord) ||
                        questionWord.includes(userWord)
                    )
                ) {
                    score += 1;
                }
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }

    // 4. Require meaningful similarity
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