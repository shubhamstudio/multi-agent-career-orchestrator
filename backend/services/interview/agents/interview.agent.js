import llm from "../config/llm.js"
import hrInterviewPrompt from "../prompts/hrInterviewPrompt.js"
import technicalInterviewPrompt from "../prompts/technicalInterviewPrompt.js"

const responseText = (content) => Array.isArray(content)
    ? content.map((part) => typeof part === "string" ? part : part?.text || "").join("")
    : String(content || "");

const parseQuestions = (content) => {
    const questions = JSON.parse(responseText(content).replace(/```json/gi, "").replace(/```/g, "").trim());
    if (!Array.isArray(questions) || questions.length !== 6) {
        throw new Error("The question generator returned an incomplete interview.");
    }

    return questions.map((item, index) => {
        const question = String(item?.question || "").trim();
        const difficulty = String(item?.difficulty || "").toLowerCase();
        const timer = Number(item?.timer);
        if (!question || !["easy", "medium", "hard"].includes(difficulty) || !Number.isFinite(timer)) {
            throw new Error(`Question ${index + 1} has an invalid format.`);
        }
        return { question: question.slice(0, 1200), difficulty, timer: Math.max(60, Math.min(1800, Math.round(timer))) };
    });
};


export const interviewAgent = async (data) => {

    try {
        const prompt = data.type?.toLowerCase() === "hr" ? hrInterviewPrompt(data) : technicalInterviewPrompt(data)

        const response = await llm.invoke(prompt)

        return parseQuestions(response.content)
    } catch (error) {
        console.error("Interview question generation failed:", error.message);
        throw new Error("Could not generate valid interview questions. Please try again.");
    }
}
