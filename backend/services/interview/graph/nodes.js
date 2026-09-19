import { feedbackAgent } from "../agents/feedback.agent.js";
import { interviewAgent } from "../agents/interview.agent.js";
import { summaryAgent } from "../agents/summary.agent.js";

const toTextList = (value) => {
    if (Array.isArray(value)) return value.map((item) => typeof item === "object" ? JSON.stringify(item) : String(item));
    if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
    return [];
};

const normalizeResumeForPrompt = (resume = {}) => ({
    ...resume,
    skills: toTextList(resume.skills),
    projects: toTextList(resume.projects),
    strengths: toTextList(resume.strengths),
    weaknesses: toTextList(resume.weaknesses),
    missingSkills: toTextList(resume.missingSkills),
    recommendations: toTextList(resume.recommendations),
});


export async function interviewNode(state) {
    const questions = await interviewAgent({
        role:state.role,
        type:state.type,
        useResume:state.useResume,
        resume: normalizeResumeForPrompt(state.resume)

    })

    return {
        questions
    }
    
}

export async function feedbackNode(state) {
    const feedback = await feedbackAgent({
        question: state.question,

        answer: state.answer,

        difficulty: state.difficulty,

    })

    return {
        feedback
    }
}


export async function summaryNode(state) {
    const report = await summaryAgent({
         role: state.role,

        type: state.type,

        questions: state.questions,
    })

    return {
        report
    }
}
