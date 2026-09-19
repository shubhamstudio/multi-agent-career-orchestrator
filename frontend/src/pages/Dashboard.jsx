import { useEffect, useMemo, useState } from 'react'
import { motion } from "motion/react"
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import api from '..//utils/axios'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getAllInterviews } from '../apis/interview.api'
import { getResume } from '../apis/resume.api'
import { FiMenu } from "react-icons/fi"
import { FiFileText, FiMic, FiBarChart2, FiMap, FiTrendingUp, FiAward, FiArrowUpRight, FiCheckCircle, FiTarget } from "react-icons/fi"

const Dashboard = ({ user, setUser }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [interviewData, setInterviewData] = useState(null)
    const [resumeData, setResumeData] = useState(null)
    const [roadmaps, setRoadmaps] = useState([])
    const [statsLoading, setStatsLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        let isMounted = true

        const refreshDashboard = async () => {
            const [interviewsResult, resumeResult, roadmapResult] = await Promise.allSettled([
                getAllInterviews(),
                getResume(),
                api.get("/api/roadmap/all"),
            ])
            if (!isMounted) return
            if (interviewsResult.status === "fulfilled" && interviewsResult.value?.success) setInterviewData(interviewsResult.value)
            if (resumeResult.status === "fulfilled" && resumeResult.value?.success) setResumeData(resumeResult.value.data)
            if (roadmapResult.status === "fulfilled" && roadmapResult.value?.data?.success) setRoadmaps(roadmapResult.value.data.data || [])
            setLastUpdated(new Date())
            setStatsLoading(false)
        }

        refreshDashboard()
        const intervalId = window.setInterval(refreshDashboard, 30_000)
        window.addEventListener("focus", refreshDashboard)

        return () => {
            isMounted = false
            window.clearInterval(intervalId)
            window.removeEventListener("focus", refreshDashboard)
        }
    }, [])

    const dashboardMetrics = useMemo(() => {
        const interviews = interviewData?.interviews || []
        const completed = interviews
            .filter((item) => item.status === "completed")
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        const latestScore = completed.at(-1)?.overallScore ?? 0
        const previousScore = completed.at(-2)?.overallScore
        const scoreChange = previousScore === undefined ? null : latestScore - previousScore
        const practiceMinutes = completed.reduce(
            (total, interview) => total + interview.questions.reduce((sum, question) => sum + (question.timer || 60), 0) / 60,
            0
        )

        const activeRoadmap = roadmaps[0]
        const requiredTopics = activeRoadmap?.nodes?.filter((node) => node.type !== "optional") || []
        const completedTopics = requiredTopics.filter((node) => node.status === "completed").length
        const roadmapProgress = requiredTopics.length ? Math.round((completedTopics / requiredTopics.length) * 100) : 0
        const resumeScores = (resumeData?.scoreHistory || []).map((entry) => Number(entry.score) || 0)
        if (resumeData?.score !== undefined) resumeScores.push(Number(resumeData.score) || 0)
        const resumeBest = resumeScores.length ? Math.max(...resumeScores) : null
        const interviewAverage = completed.length ? completed.reduce((sum, item) => sum + (Number(item.overallScore) || 0), 0) / completed.length : 0
        const availableSignals = [resumeBest !== null, completed.length > 0, requiredTopics.length > 0]
        const signalValues = [resumeBest || 0, interviewAverage, roadmapProgress]
        const signalCount = availableSignals.filter(Boolean).length
        const readinessScore = signalCount
            ? Math.round(signalValues.reduce((sum, value, index) => sum + (availableSignals[index] ? value : 0), 0) / signalCount)
            : 0
        const nextRoadmapTopic = activeRoadmap?.nodes?.find((node) => ["available", "in-progress"].includes(node.status))
        const technicalSkills = Object.fromEntries((interviewData?.technicalData || []).map((item) => [item.skill, Number(item.score) || 0]))
        const hrSkills = Object.fromEntries((interviewData?.hrData || []).map((item) => [item.skill, Number(item.score) || 0]))
        const technicalCount = interviewData?.technicalCount || 0
        const hrCount = interviewData?.hrCount || 0
        const combinedSkill = (name) => {
            const count = technicalCount + hrCount
            return count ? Math.round(((technicalSkills[name] || 0) * technicalCount + (hrSkills[name] || 0) * hrCount) / count) : 0
        }
        const makeArea = (title, color, skills) => {
            const data = skills.map(([label, source]) => ({ skill: label, score: typeof source === "number" ? source : combinedSkill(source), fullMark: 100 }))
            return { title, color, data, score: Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length) }
        }
        const knowledgeAreas = [
            makeArea("Core knowledge", "#9dbd00", [["Accuracy", "Correctness"], ["Relevance", "Relevance"], ["Depth", "Detail"]]),
            makeArea("Communication", "#7c6ee6", [["Clarity", "Clarity"], ["Delivery", "Communication"], ["Relevance", "Relevance"]]),
            makeArea("Problem solving", "#ea8d52", [["Reasoning", "Problem solving"], ["Efficiency", "Efficiency"], ["Creativity", "Creativity"]]),
            makeArea("Career alignment", "#40a8b5", [["Resume", resumeBest || 0], ["Interview", Math.round(interviewAverage)], ["Roadmap", roadmapProgress]]),
        ]
        const averageSkillSet = (skills, count) => {
            const scores = Object.values(skills)
            return count && scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
        }
        const typePerformance = [
            { type: "Technical", score: averageSkillSet(technicalSkills, technicalCount), sessions: technicalCount, color: "#a6c900" },
            { type: "HR", score: averageSkillSet(hrSkills, hrCount), sessions: hrCount, color: "#7668db" },
        ]

        return {
            completed,
            bestScore: completed.length ? Math.max(...completed.map((item) => Number(item.overallScore) || 0)) : null,
            scoreHistory: completed.map((item, index) => ({
                name: new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                score: Number(item.overallScore) || 0,
                interview: index + 1,
            })),
            scoreChange,
            practiceHours: practiceMinutes >= 60
                ? `${(practiceMinutes / 60).toFixed(1)}h`
                : `${Math.round(practiceMinutes)}m`,
            knowledgeAreas,
            performanceRadar: knowledgeAreas.map((area) => ({ area: area.title.replace("Career alignment", "Alignment"), score: area.score, fullMark: 100 })),
            typePerformance,
            activeRoadmap,
            completedTopics,
            totalTopics: requiredTopics.length,
            roadmapProgress,
            resumeBest,
            resumeLatest: resumeData?.score ?? null,
            readinessScore,
            nextRoadmapTopic,
        }
    }, [interviewData, resumeData, roadmaps])

    const handleLogout = async () => {
        try {
            const response = await api.get("/api/auth/logout")

            if (response.data.success) {
                setUser(null)
                navigate("/")
            }
        } catch (error) {
            console.error(error)
        }
    }

    const stats = [
        { icon: <FiTarget />, label: "Career Readiness", value: statsLoading ? "—" : `${dashboardMetrics.readinessScore}%`, color: "stat-icon-coral" },
        { icon: <FiMap />, label: "Roadmap Progress", value: dashboardMetrics.totalTopics ? `${dashboardMetrics.roadmapProgress}%` : "—", color: "stat-icon-violet" },
        {
            icon: <FiAward />,
            label: "Best Interview Score",
            value: dashboardMetrics.bestScore === null ? "—" : `${dashboardMetrics.bestScore}/100`,
            color: "stat-icon-sky",
        },
        { icon: <FiFileText />, label: "Best Resume Score", value: dashboardMetrics.resumeBest === null ? "—" : `${dashboardMetrics.resumeBest}/100`, color: "stat-icon-amber" },
    ]

    const quickActions = [
        {
            icon: <FiFileText />,
            title: "Build Your Resume",
            desc: "Create an ATS-friendly resume with AI-powered suggestions.",
            path: "/resume",
        },
        {
            icon: <FiMic />,
            title: "Start an Interview",
            desc: "Practice with realistic HR, technical, and coding simulations.",
            path: "/interview",
        },
        {
            icon: <FiBarChart2 />,
            title: "Review Feedback",
            desc: "See detailed scoring and improvement recommendations.",
            path: "/feedback",
        },
        {
            icon: <FiMap />,
            title: "View Roadmap",
            desc: "Follow a personalized plan based on your goals and skills.",
            path: "/roadmap",
        },
    ]

    return (
        <div className='theme-page font-sans overflow-x-hidden relative'>
            <div className='dashboard-aurora' />
            <Sidebar
                user={user}
                onNewInterview={() => navigate("/interview")}
                onLogout={handleLogout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <main
                className={`dashboard-main relative z-10 md:transition-none ${sidebarOpen ? "md:ml-[260px]" : "md:ml-[72px]"
                    }`}
            >
                {/* Top bar */}
                <div className='dashboard-topbar'>
                    <button
                        onClick={() => setMobileOpen(true)}
                        className='dashboard-menu-btn md:hidden'
                    >
                        <FiMenu size={20} />
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        aria-label="Open profile"
                        title="Open profile"
                        className='dashboard-topbar-user cursor-pointer rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d2ff00]/30'
                    >
                        <div className='sidebar-avatar sidebar-avatar-sm'>
                            {user?.name ? user.name[0].toUpperCase() : "U"}
                        </div>
                    </button>
                </div>

                {/* Welcome */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className='dashboard-welcome'
                >
                    <p className='dashboard-eyebrow'>Dashboard</p>
                    <h1 className='dashboard-heading'>
                        Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                    </h1>
                    <p className='dashboard-subtext'>
                        Your preparation workspace, connected to your latest interview results.
                    </p>
                    <p className='mt-2 text-xs text-black/40'>
                        {statsLoading ? "Updating performance data…" : `Live data · updated ${lastUpdated?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                </motion.section>

                {/* Stats */}
                <div className='dashboard-stats-grid'>
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                            className='stat-card'
                        >
                            <div className={`stat-icon-badge ${stat.color}`}>{stat.icon}</div>
                            <p className='stat-value'>{stat.value}</p>
                            <p className='stat-label'>{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <section className='mt-8'>
                    <div className='mb-4 flex items-center justify-between gap-3'>
                        <h2 className='dashboard-section-title'>Performance insights</h2>
                        <button
                            onClick={() => navigate("/feedback")}
                            className='text-xs font-semibold text-[#708900] hover:text-[#536800]'
                        >
                            View reports →
                        </button>
                    </div>

                    <div className='grid grid-cols-1 gap-4 xl:grid-cols-3'>
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: 0.15 }}
                            className='glass-surface overflow-hidden p-4 sm:p-5'
                        >
                            <div className='mb-4'>
                                <p className='text-sm font-semibold'>Score progression</p>
                                <p className='mt-1 text-xs text-black/45'>Your completed interview scores over time</p>
                            </div>
                            {dashboardMetrics.scoreHistory.length ? (
                                <ResponsiveContainer width="100%" height={300} debounce={100}>
                                    <LineChart data={dashboardMetrics.scoreHistory} margin={{ top: 12, right: 14, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="rgba(29,25,22,0.10)" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#77716d", fontSize: 11 }} />
                                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#77716d", fontSize: 11 }} />
                                        <Tooltip
                                            cursor={{ stroke: "rgba(210,255,0,0.38)", strokeDasharray: "4 4" }}
                                            contentStyle={{ borderRadius: 12, border: "1px solid #ebe6e1", background: "rgba(255,255,255,.97)", boxShadow: "0 12px 30px rgba(44,33,27,0.10)" }}
                                            formatter={(value) => [`${value}/100`, "Score"]}
                                        />
                                        <Line type="linear" dataKey="score" stroke="#9fbe00" strokeWidth={3} dot={{ r: 4, fill: "#fff", stroke: "#9fbe00", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#d2ff00", stroke: "#fff", strokeWidth: 2 }} isAnimationActive={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className='flex h-[250px] flex-col items-center justify-center rounded-xl border border-[#eee7e1] bg-[#fbffed] text-center'>
                                    <FiTrendingUp className='mb-3 text-[#819e00]' size={26} />
                                    <p className='text-sm font-semibold'>Your score trend will appear here</p>
                                    <button onClick={() => navigate("/interview")} className='mt-3 text-xs font-semibold text-[#708900]'>Start your first interview →</button>
                                </div>
                            )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, delay: .21 }} className='glass-surface overflow-hidden p-4 sm:p-5'>
                            <div className='mb-2 flex items-start justify-between gap-3'><div><p className='text-sm font-semibold'>Overall performance</p><p className='mt-1 text-xs text-black/45'>Your readiness across key career areas</p></div><span className='rounded-lg bg-[#f6ffd9] px-2 py-1 text-xs font-black text-[#708900]'>{dashboardMetrics.readinessScore}%</span></div>
                            {dashboardMetrics.completed.length || dashboardMetrics.resumeLatest !== null || dashboardMetrics.totalTopics ? (
                                <ResponsiveContainer width="100%" height={270} debounce={100}>
                                    <RadarChart data={dashboardMetrics.performanceRadar} outerRadius="66%" margin={{ top: 10, right: 24, bottom: 4, left: 24 }}>
                                        <PolarGrid stroke="rgba(45,39,35,.14)" />
                                        <PolarAngleAxis dataKey="area" tick={{ fill: "#716a65", fontSize: 9 }} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7e0da", background: "rgba(255,255,255,.98)", fontSize: 11, boxShadow: "0 10px 24px rgba(44,33,27,.10)" }} formatter={(value) => [`${value}%`, "Performance"]} />
                                        <Radar dataKey="score" stroke="#91ae00" fill="#d2ff00" fillOpacity={.28} strokeWidth={2.5} dot={{ r: 3, fill: "#91ae00" }} isAnimationActive={false} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : <InsightEmpty icon={<FiTrendingUp size={25} />} title="Build your performance profile" text="Complete an agent activity to populate this chart." />}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, delay: .27 }} className='glass-surface overflow-hidden p-4 sm:p-5'>
                            <div className='mb-2'><p className='text-sm font-semibold'>Interview performance</p><p className='mt-1 text-xs text-black/45'>Average skill score by interview format</p></div>
                            {dashboardMetrics.completed.length ? (
                                <ResponsiveContainer width="100%" height={270} debounce={100}>
                                    <BarChart data={dashboardMetrics.typePerformance} margin={{ top: 24, right: 12, left: -18, bottom: 0 }} barSize={54}>
                                        <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="rgba(29,25,22,.10)" />
                                        <XAxis dataKey="type" tickLine={false} axisLine={false} tick={{ fill: "#77716d", fontSize: 11 }} />
                                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#77716d", fontSize: 10 }} />
                                        <Tooltip cursor={{ fill: "rgba(210,255,0,.06)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e7e0da", background: "rgba(255,255,255,.98)", fontSize: 11, boxShadow: "0 10px 24px rgba(44,33,27,.10)" }} formatter={(value, name, item) => [`${value}% · ${item.payload.sessions} session${item.payload.sessions === 1 ? "" : "s"}`, "Average"]} />
                                        <Bar dataKey="score" radius={[12, 12, 4, 4]} isAnimationActive={false}>{dashboardMetrics.typePerformance.map((entry) => <Cell key={entry.type} fill={entry.color} />)}</Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <InsightEmpty icon={<FiMic size={25} />} title="No interview comparison yet" text="Complete an HR or technical interview to see its score." />}
                        </motion.div>
                    </div>
                </section>

                <section className='mt-10 grid gap-4 lg:grid-cols-[1.35fr_.65fr]'>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }} className='glass-surface p-5 sm:p-6'>
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                            <div><p className='dashboard-eyebrow'>Your active journey</p><h2 className='mt-2 text-xl font-bold'>{dashboardMetrics.activeRoadmap?.title || "Create your personalized roadmap"}</h2><p className='mt-1 text-xs text-black/45'>{dashboardMetrics.activeRoadmap ? `${dashboardMetrics.completedTopics} of ${dashboardMetrics.totalTopics} required topics completed` : "Turn your target role into a guided learning plan."}</p></div>
                            <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: .97 }} onClick={() => navigate(dashboardMetrics.activeRoadmap ? `/roadmap?id=${dashboardMetrics.activeRoadmap._id}` : '/roadmap')} className='cursor-pointer rounded-xl border border-[#dce9a9] bg-[#f7ffd9] px-4 py-2 text-xs font-bold text-[#607700] shadow-sm transition-colors hover:border-[#bdd84d] hover:bg-[#f1ffc2]'>{dashboardMetrics.activeRoadmap ? "Open roadmap" : "Build roadmap"}</motion.button>
                        </div>
                        <div className='mt-6 h-3 overflow-hidden rounded-full bg-[#eeeae5]'><motion.div initial={{ width: 0 }} animate={{ width: `${dashboardMetrics.roadmapProgress}%` }} transition={{ duration: .8, ease: "easeOut" }} className='h-full rounded-full bg-[linear-gradient(90deg,#8eae00,#d2ff00)]' /></div>
                        <div className='mt-3 flex justify-between text-xs'><span className='font-semibold'>{dashboardMetrics.roadmapProgress}% complete</span><span className='text-black/45'>{dashboardMetrics.activeRoadmap?.duration || "Not started"}</span></div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18 }} className='rounded-[22px] bg-[#171514] p-5 text-white shadow-[0_18px_45px_rgba(23,21,20,.16)]'>
                        <div className='flex items-center gap-2 text-[#d2ff00]'><FiCheckCircle /><p className='text-[10px] font-bold uppercase tracking-[.18em]'>Next best action</p></div>
                        <h3 className='mt-4 text-lg font-bold'>{dashboardMetrics.nextRoadmapTopic?.title || (dashboardMetrics.resumeLatest === null ? "Analyze your resume" : "Practice an interview")}</h3>
                        <p className='mt-2 text-xs leading-5 text-white/55'>{dashboardMetrics.nextRoadmapTopic?.description || (dashboardMetrics.resumeLatest === null ? "Get a baseline score and personalized improvements." : "Build evidence of improvement with your next scored session.")}</p>
                        <motion.button whileHover={{ x: 3 }} whileTap={{ scale: .97 }} onClick={() => navigate(dashboardMetrics.nextRoadmapTopic ? `/roadmap?id=${dashboardMetrics.activeRoadmap._id}` : dashboardMetrics.resumeLatest === null ? '/scorer' : '/interview')} className='mt-5 flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-xs font-bold text-[#d2ff00] hover:text-white'>Continue <FiArrowUpRight /></motion.button>
                    </motion.div>
                </section>

                {/* Quick Actions */}
                <div className='mt-10 mb-10'>
                    <div className='mb-4 flex items-center justify-between'>
                        <h2 className='dashboard-section-title mb-0'>Continue your prep</h2>
                        {dashboardMetrics.completed.length > 0 && <span className='text-xs text-[#667085]'>{dashboardMetrics.completed.length} reports available</span>}
                    </div>
                    <div className='quick-actions-grid'>
                        {quickActions.map((action, i) => (
                            <motion.button
                                key={action.title}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: i * 0.08 }}
                                whileHover={{ y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(action.path)}
                                className='glass-action group cursor-pointer p-5'
                            >
                                <div className='agent-card-glow' />
                                <div className='agent-card-blob' />
                                <div className='relative'>
                                    <div className='agent-icon-badge'>{action.icon}</div>
                                    <div className='flex items-center justify-between gap-3'>
                                        <h3 className='agent-card-title'>{action.title}</h3>
                                        <FiArrowUpRight className='mb-2 text-[#819e00] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1' />
                                    </div>
                                    <p className='agent-card-desc'>{action.desc}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}

function InsightEmpty({ icon, title, text }) {
    return <div className='flex h-[270px] flex-col items-center justify-center rounded-xl bg-[#fbffed] px-5 text-center text-[#819e00]'>{icon}<p className='mt-3 text-sm font-semibold text-[#302c29]'>{title}</p><p className='mt-1 max-w-xs text-xs leading-5 text-black/45'>{text}</p></div>
}

export default Dashboard
