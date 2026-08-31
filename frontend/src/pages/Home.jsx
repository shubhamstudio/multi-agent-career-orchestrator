import { useState } from 'react'
import { motion } from "motion/react"
import { FaArrowRight } from "react-icons/fa"
import { FiCheckCircle, FiFileText, FiMap, FiMic, FiBarChart2, FiStar } from "react-icons/fi"
import LoginModel from './../components/LoginModel'
import Footer from './../components/Footer'
import Brand from './../components/Brand'
import "./../index.css"
import { Link } from 'react-router-dom'

const Home = ({ setUser }) => {
    const [showLogin, setShowLogin] = useState(false)

    return (
        <div className='theme-page font-sans overflow-x-hidden relative'>

            {/* Navbar */}
            <div className="pt-4 px-4">
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className='navbar'
                >
                    <Brand className='navbar-logo' />

                    <div className="flex items-center gap-4">
                    <Link to="/about" className="hidden text-xs font-semibold text-[#5d5753] hover:text-[#708900] sm:block">About</Link>
                    <Link to="/faq" className="hidden text-xs font-semibold text-[#5d5753] hover:text-[#708900] sm:block">FAQ</Link>
                    <motion.button
                        onClick={() => setShowLogin(true)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className='nav-login-btn'
                    >
                        Login
                    </motion.button>
                    </div>
                </motion.nav>
            </div>

            {/* Main Hero Section */}
            <section className='relative pt-16 pb-14 overflow-hidden'>
                {/* Subtle soft background blur element */}
                <div className='absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-lime-200/25 blur-[100px] pointer-events-none' />

                <div className='max-w-4xl mx-auto px-6 text-center relative z-10 flex flex-col items-center gap-6'>

                    {/* Eyebrow Label */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="eyebrow-badge"
                    >
                        Multi-Agent Interview Platform
                    </motion.div>

                    {/* Headline Slogan */}
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Ace It Before You Face It<br />
                        Real questions. Real interviewers.
                    </motion.h1>

                    {/* Subtitle Text */}
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className='max-w-2xl leading-relaxed'
                    >
                        GLANGEN is an innovative AI-powered interview preparation platform designed to help job seekers excel in their interviews.
                    </motion.h2>

                    {/* Action Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="pt-2"
                    >
                        <motion.button
                            className='primary-button inline-flex items-center gap-2 shadow-lg hover:shadow-lime-500/20'
                            onClick={() => setShowLogin(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Get Started <FaArrowRight size={14} />
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Animated product showcase */}
            <motion.section
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="hero-showcase-wrap"
            >
                <div className="hero-orb hero-orb-teal" />
                <div className="hero-orb hero-orb-amber" />
                <div className="hero-feature-grid">
                    <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} whileHover={{ y: -5, rotate: -0.5 }} className="hero-feature-card hero-feature-resume">
                        <div className="hero-feature-icon bg-lime-50 text-[#819e00]"><FiFileText /></div>
                        <p className="hero-feature-label">Resume Studio</p>
                        <h3>ATS ready</h3>
                        <div className="hero-document"><span /><span /><span /><span /></div>
                        <div className="hero-feature-footer"><FiCheckCircle /> 92% profile strength</div>
                    </motion.article>

                    <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.18 }} whileHover={{ y: -5, rotate: 0.5 }} className="hero-feature-card hero-feature-feedback">
                        <div className="hero-feature-icon bg-lime-50 text-[#819e00]"><FiBarChart2 /></div>
                        <p className="hero-feature-label">Feedback</p>
                        <h3>Clear &amp; confident</h3>
                        <div className="flex items-center gap-1 text-amber-400">{[1, 2, 3, 4, 5].map((star) => <FiStar key={star} fill="currentColor" size={15} />)}</div>
                        <p className="hero-quote">“Felt like a real interview.”</p>
                        <div className="hero-feature-footer">Riya · Software Engineer</div>
                    </motion.article>

                    <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.26 }} whileHover={{ y: -5, rotate: 0.5 }} className="hero-feature-card hero-feature-interview">
                        <div className="hero-feature-icon bg-lime-50 text-[#819e00]"><FiMic /></div>
                        <p className="hero-feature-label">AI Interview</p>
                        <h3>Question 04</h3>
                        <p className="hero-question-copy">Improve the reliability of a distributed API.</p>
                        <div className="hero-live-pill"><span /> Evaluating answer</div>
                    </motion.article>

                    <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.34 }} whileHover={{ y: -5, rotate: -0.5 }} className="hero-feature-card hero-feature-roadmap">
                        <div className="hero-feature-icon bg-lime-50 text-[#819e00]"><FiMap /></div>
                        <p className="hero-feature-label">Roadmap Builder</p>
                        <h3>Your next move</h3>
                        <div className="hero-roadmap-steps"><span>1</span><i /><span>2</span><i /><span>3</span></div>
                        <div className="hero-feature-footer">System design · Week 2</div>
                    </motion.article>
                </div>
            </motion.section>
            {/* Agents */}
            <section className='agents-section'>
                <div className='absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-lime-200/20 blur-[110px] pointer-events-none' />
                <div className='max-w-5xl mx-auto px-6 relative z-10'>
                    <div className='text-center mb-10'>
                        <div className='agents-eyebrow'>
                            AI POWERED AGENTS
                        </div>

                        <h2 className='agents-heading text-gradient'>
                            Specialized Agents For
                            <span className='block'>
                                Every Interview Stage
                            </span>
                        </h2>
                        <p className='agents-subtext'>
                            GLANGEN combines Multiple AI Agents that work under the hood to help you build your resume, practice interviews, receive detailed feedback, and follow a personalized roadmap to land your dream job.
                        </p>

                    </div>
                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
                        {
                            [
                                {
                                    icon: <FiFileText />,
                                    color: "#d2ff00",
                                    title: "Resume Agent",
                                    desc: "Create ATS-friendly resumes, improve profile strength and maximize interview opportunities"
                                },
                                {
                                    icon: <FiMic />,
                                    color: "#d2ff00",
                                    title: "Interview Agent",
                                    desc: "Conduct realistic HR, Technical and Coding interviews with AI-powered simulations."
                                },
                                {
                                    icon: <FiBarChart2 />,
                                    color: "#d2ff00",
                                    title: "Feedback Agent",
                                    desc: "Get detailed answer analysis, scoring reports and improvement recommendations."
                                },
                                {
                                    icon: <FiMap />,
                                    color: "#d2ff00",
                                    title: "Roadmap Agent",
                                    desc: "Generate personalized learning roadmaps based on goals, skills and performance."
                                },
                            ].map((agent, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.45, delay: i * 0.08 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className='group agent-card'>
                                    <div className='agent-card-glow' />
                                    <div className='agent-card-blob' />
                                    <div className='relative'>
                                        <div className='agent-icon-badge' style={{ background: agent.color }}>
                                            {agent.icon}
                                        </div>
                                        <h3 className='agent-card-title'>{agent.title}</h3>
                                        <p className='agent-card-desc'>{agent.desc}</p>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            </section>

            {/* Login Modal */}
            {showLogin && (
                <LoginModel onClose={() => setShowLogin(false)} setUser={setUser} />
            )}
            <Footer />
        </div>
    )
}

export default Home
