import { motion } from "motion/react"
import { FiBarChart2, FiFileText, FiMap, FiMessageSquare, FiTarget, FiZap } from "react-icons/fi"
import { Link } from "react-router-dom"
import Brand from "../components/Brand"
import Footer from "../components/Footer"

const agents = [
    [FiFileText, "Resume Agent", "Builds and evaluates ATS-ready resumes, surfacing strengths, gaps, and practical improvements."],
    [FiMessageSquare, "Interview Agent", "Runs role-aware HR and technical practice sessions in an interactive environment."],
    [FiBarChart2, "Feedback Agent", "Turns every response into measurable feedback on clarity, correctness, and communication."],
    [FiMap, "Roadmap Agent", "Creates a personalized learning path and tracks progress from the next topic to the target role."],
]

export default function About() {
    return <div className="theme-page min-h-screen font-sans">
        <PublicNav />
        <main>
            <section className="public-hero">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl text-center">
                    <p className="dashboard-eyebrow">About Glangen</p>
                    <h1 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">Your career agents, working as one.</h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#68615c] sm:text-lg">Glangen is a multi-agent career orchestration platform that connects preparation, practice, feedback, and progress in one continuous journey.</p>
                </motion.div>
            </section>
            <section className="public-section">
                <div className="grid gap-5 md:grid-cols-2">{agents.map(([Icon, title, text]) => <article key={title} className="public-card"><span className="agent-icon-badge"><Icon /></span><h2>{title}</h2><p>{text}</p></article>)}</div>
            </section>
            <section className="public-section grid gap-6 lg:grid-cols-2">
                <div className="rounded-[28px] bg-[#171514] p-8 text-white"><FiTarget className="text-[#d2ff00]" size={26} /><h2 className="mt-5 text-3xl font-bold">Why we built it</h2><p className="mt-4 leading-7 text-white/65">Career growth is usually scattered across documents, mock interviews, courses, and generic advice. Glangen keeps those signals connected, so every agent understands the same goal and every action builds on the last.</p></div>
                <div className="rounded-[28px] border border-[#dfeab6] bg-[#f7ffd9] p-8"><FiZap className="text-[#708900]" size={26} /><h2 className="mt-5 text-3xl font-bold">What makes it different</h2><p className="mt-4 leading-7 text-[#5e604e]">Glangen is designed around progress—not isolated AI outputs. Resume scores, interview feedback, skill gaps, and roadmap completion come together to recommend the next best action.</p></div>
            </section>
            <section className="public-section text-center"><h2 className="text-3xl font-bold">Build evidence. Improve deliberately. Move forward.</h2><Link to="/" className="primary-button mt-6 inline-flex">Start with Glangen</Link></section>
        </main>
        <Footer />
    </div>
}

export function PublicNav() {
    return <div className="px-4 pt-4"><nav className="navbar"><Link to="/"><Brand className="navbar-logo" /></Link><div className="flex items-center gap-4 text-xs font-semibold"><Link to="/about" className="hidden hover:text-[#708900] sm:block">About</Link><Link to="/faq" className="hidden hover:text-[#708900] sm:block">FAQ</Link><Link to="/" className="nav-login-btn">Open Glangen</Link></div></nav></div>
}
