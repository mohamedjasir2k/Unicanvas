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
    const normalizedMessage = normalize(userMessage);

    // Aarav horror story
    
    /* =========================================================
       1. EXACT / CONTAINED MATCH
    ========================================================= */

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


    /* =========================================================
       2. COMMON QUESTION WORDS
    ========================================================= */

    const stopWords = new Set([
        "what",
        "when",
        "where",
        "why",
        "who",
        "which",
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
        "was",
        "were",
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
        "show",
        "say",
        "know",
        "about",
        "for",
        "to",
        "of",
        "on",
        "in",
        "with",
        "and",
        "or",
        "it",
        "this",
        "that",
        "from",
        "there",
        "here",
        "please"
    ]);


    /* =========================================================
       3. SYNONYM / MEANING GROUPS

       Words inside the same group are treated as related.
    ========================================================= */

    const synonymGroups = [

        // Stories
        [
            "horror",
            "scary",
            "scared",
            "frightening",
            "fright",
            "spooky",
            "haunted",
            "ghost"
        ],

        [
            "story",
            "tale",
            "stories",
            "tales"
        ],

        // Ideas
        [
            "idea",
            "ideas",
            "concept",
            "concepts",
            "suggestion",
            "suggestions"
        ],

        // Projects
        [
            "project",
            "projects",
            "assignment",
            "assignments"
        ],

        // Research
        [
            "research",
            "investigate",
            "investigation",
            "study",
            "studying"
        ],

        // Creativity
        [
            "creative",
            "creativity",
            "create",
            "creating",
            "creation"
        ],

        // Motivation
        [
            "motivation",
            "motivate",
            "motivated",
            "encourage",
            "encouragement"
        ],

        // Focus
        [
            "focus",
            "focused",
            "concentrate",
            "concentration",
            "attention"
        ],

        // Help
        [
            "help",
            "assist",
            "assistance",
            "support"
        ],

        // Presentation
        [
            "presentation",
            "present",
            "presenting",
            "speech",
            "explain"
        ]
    ];


    function areRelatedWords(word1, word2) {

        if (word1 === word2) {
            return true;
        }

        for (const group of synonymGroups) {

            if (
                group.includes(word1) &&
                group.includes(word2)
            ) {
                return true;
            }

        }

        return false;
    }


    /* =========================================================
       4. CLEAN USER WORDS
    ========================================================= */

    const userWords =
        normalizedUserMessage
            .split(" ")
            .filter(word =>
                word.length >= 3 &&
                !stopWords.has(word)
            );


    /* =========================================================
       5. FIND BEST MATCH
    ========================================================= */

    let bestMatch = null;
    let bestScore = 0;

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

        if (!questionWords.length) {
            continue;
        }

        let score = 0;

        for (const userWord of userWords) {

            for (const questionWord of questionWords) {

                /* Exact word */
                if (userWord === questionWord) {
                    score += 3;
                }

                /* Synonym / related meaning */
                else if (
                    areRelatedWords(
                        userWord,
                        questionWord
                    )
                ) {
                    score += 3;
                }

                /* Similar longer words */
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


        /* =====================================================
           6. BONUS FOR MULTIPLE MATCHING WORDS
        ===================================================== */

        const uniqueMatches = new Set();

        for (const userWord of userWords) {

            for (const questionWord of questionWords) {

                if (
                    userWord === questionWord ||
                    areRelatedWords(
                        userWord,
                        questionWord
                    )
                ) {
                    uniqueMatches.add(questionWord);
                }

            }

        }

        if (uniqueMatches.size >= 2) {
            score += 2;
        }


        /* =====================================================
           7. KEEP THE STRONGEST MATCH
        ===================================================== */

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }

    }


    /* =========================================================
       8. REQUIRE A MEANINGFUL MATCH

       This prevents Uni from answering a completely unrelated
       question just because one common word matched.
    ========================================================= */

    if (bestMatch && bestScore >= 3) {
        return bestMatch.answer;
    }


    return null;
}

app.post("/api/chat", (req, res) => {
    const userMessage =
        req.body?.message ||
        req.body?.messages?.filter(
            item => item?.role === "user"
        ).at(-1)?.content ||
        "";

    if (!String(userMessage).trim()) {
        return res.status(400).json({
            answer: "Please enter a message.",
            reply: "Please enter a message."
        });
    }

    const answer = findKnowledgeAnswer(userMessage) ||
        "I don't have an answer for that yet. Try asking me about brainstorming, project ideas, research, presentations, innovation, focus, or UniCanvas.";

    // Support both the old and current frontend response formats.
    return res.json({
        answer,
        reply: answer
    });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`UniCanvas server running on port ${PORT}`);
});