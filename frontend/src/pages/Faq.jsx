import { useState } from "react"
import { FiChevronDown } from "react-icons/fi"
import Footer from "../components/Footer"
import { PublicNav } from "./About"

const questions = [
    ["What is Glangen?", "Glangen is a multi-agent career orchestration platform. It coordinates specialized Resume, Interview, Feedback, and Roadmap agents to help you prepare for roles and track improvement over time."],
    ["How do the four agents work together?", "Your resume and goals provide context. The Interview Agent runs practice sessions, the Feedback Agent evaluates performance, and the Roadmap Agent turns skill gaps into an actionable learning plan."],
    ["Can I use Glangen without a resume?", "Yes. You can practice interviews and generate a roadmap without a resume. Adding one enables richer personalization and resume-specific scoring."],
    ["What does the resume score measure?", "The score reflects the structure, clarity, content, skills, and role-readiness identified during analysis. Recommendations explain the improvements behind the score."],
    ["What interview formats are available?", "Glangen supports HR and technical interview practice, with role-aware questions, timed answers, detailed scoring, and improvement recommendations."],
    ["How is roadmap progress calculated?", "Progress is based on required topics completed in your active roadmap. Completing prerequisites unlocks later topics and keeps the next action clear."],
    ["Can I edit my career information?", "Yes. Your profile lets you update your current role, target role, experience level, skills, location, bio, and career goal."],
    ["Are AI results guaranteed to get me a job?", "No. Glangen is a preparation and decision-support tool. Its feedback should be combined with your judgment, research, and advice from qualified people."],
]

export default function Faq() {
    const [open, setOpen] = useState(0)
    return <div className="theme-page min-h-screen font-sans"><PublicNav /><main><section className="public-hero text-center"><p className="dashboard-eyebrow">Questions & answers</p><h1 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">Everything you need to know.</h1><p className="mx-auto mt-5 max-w-xl leading-7 text-[#68615c]">A quick guide to Glangen, its agents, and your career progress.</p></section><section className="public-section mx-auto max-w-3xl space-y-3">{questions.map(([question, answer], index) => <article key={question} className="overflow-hidden rounded-2xl border border-[#e5ded8] bg-white"><button onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-5 p-5 text-left font-semibold"><span>{question}</span><FiChevronDown className={`shrink-0 transition-transform ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <p className="px-5 pb-5 text-sm leading-6 text-[#6f6863]">{answer}</p>}</article>)}</section></main><Footer /></div>
}
