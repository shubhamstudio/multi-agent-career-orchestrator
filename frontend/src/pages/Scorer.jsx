import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import { useState } from 'react'
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiFileText, FiShield, FiTrendingUp, FiUploadCloud, FiUser, FiZap } from 'react-icons/fi'
import api from '../utils/axios'
import { useDispatch, useSelector } from 'react-redux'
import { setResume } from '../redux/resumeSlice'
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"
import { spendCoins } from '../apis/user.api'
import ResumeScanVisual from '../components/ResumeScanVisual'
import Brand from '../components/Brand'
const ScoreRing = ({ score }) => {
    const color = score >= 75 ? "#0f766e" : score >= 50 ? "#d97706" : "#e11d48";
    return (
        <div className='relative flex items-center justify-center'>
            <RadialBarChart
                width={110}
                height={110}
                cx={55}
                cy={55}
                innerRadius={40}
                outerRadius={53}
                startAngle={90}
                endAngle={-270}
                data={[{ value: score, fill: color }]}
                barSize={8}
            >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "#e5e7eb" }} dataKey="value" cornerRadius={8} />

            </RadialBarChart>

            <div className='absolute flex  items-center'>
                <span className='text-lg font-bold text-slate-800 leading-none'>{score}</span>
                <span className='text-[9px] text-slate-500 mt-0.5'>/100</span>
            </div>

        </div>
    )
}

const Tag = ({ text, color }) => {
    const styles = {
        purple: "bg-sky-50 text-sky-700 border-sky-200",
        blue: "bg-sky-50 text-sky-700 border-sky-200",
        red: "bg-red-50    text-red-700    border-red-200",
        green: "bg-green-50  text-green-700  border-green-200",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    return (
        <div className={`text-[10px] px-1.5 py-1 rounded-md border font-medium ${styles[color]}`}>
            {text}

        </div>
    )
}

const Navbar = ({ label }) => {
    const navigate = useNavigate()
    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className='fixed inset-x-0 top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl'>
            <div className='mx-auto flex h-14 max-w-7xl items-center px-3 sm:px-5'>
                <button
                    onClick={() => navigate("/dashboard")}
                    aria-label="Back to dashboard"
                    className='mr-3 flex h-8 items-center gap-1.5 rounded-lg border border-[#ebe6e1] bg-white px-2.5 text-[#625f5c] transition hover:border-[#e2ff70] hover:text-[#708900]'>
                    <FiArrowLeft size={15} />
                    <span className='hidden text-xs font-medium sm:inline'>Back</span>
                </button>
                <div className='flex items-center gap-1.5'>
                    <Brand className='text-sm font-extrabold sm:text-base text-[#0A0A0A]' markClassName='h-5 w-5' />
                    <span className='hidden rounded bg-[#f6ffd9] px-1.5 py-0.5 text-[10px] text-[#667b00] sm:block'>{label}</span>
                </div>

            </div>

        </motion.nav>

    )
}

function Scorer({ setUser }) {
    const [file, setFile] = useState(null)
    const [fileError, setFileError] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const { resume } = useSelector((state) => state.resume)

    const selectFile = (selectedFile) => {
        setFileError("")
        if (!selectedFile) return
        if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
            setFile(null)
            setFileError("Please choose a PDF file.")
            return
        }
        if (selectedFile.size > 20 * 1024 * 1024) {
            setFile(null)
            setFileError("Your PDF must be smaller than 20MB.")
            return
        }
        setFile(selectedFile)
    }

    const uploadResume = async () => {
        if (!file) {
            alert("Please select a PDF")
            return
        }
        try {
            setLoading(true)

            try {
                const coinResponse = await spendCoins({ coins: 10, action: "resume-scorer" })
                setUser((prev) => ({
                    ...prev, interviewCoin: coinResponse?.interviewCoin,
                }))
            } catch {
                setLoading(false)
                alert("Failed to use coins.")
                return;
            }

            const formData = new FormData()
            formData.append("resume", file)

            const response = await api.post("/api/resume/upload", formData)

            dispatch(setResume(response?.data?.data))
            setLoading(false)



        } catch (error) {
            console.error("Resume upload failed:", error.response?.data || error)
            alert(error.response?.data?.message || "Upload failed")
            setLoading(false)
        }
    }
    if (loading) return (
        <div className='theme-page'>
            <Navbar label="Resume Scorer" />
            <section className='flex min-h-screen items-center justify-center px-4 pt-14'>
                <div className='theme-surface w-full max-w-md p-6 text-center sm:p-8'>
                    <ResumeScanVisual />
                    <p className='mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#819e00]'>AI resume analysis</p>
                    <h1 className='mt-2 text-xl font-bold leading-7 tracking-normal text-[#101828] [word-spacing:0.08em]'>Scanning your resume</h1>
                    <p className='mt-2 text-sm leading-6 text-[#667085]'>Extracting skills, experience, and tailored improvement ideas.</p>
                    <div className='mt-5 h-1.5 overflow-hidden rounded-full bg-[#edf2ff]'>
                        <div className='process-loader-bar h-full w-1/2 rounded-full bg-[#d2ff00]' />
                    </div>
                </div>
            </section>
        </div>
    )

    // scorer section

    if (resume) return (
        <div className='theme-page'>
            <Navbar label="Resume Review" />
            <section className='resume-review-layout'>
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }} className='resume-review-preview-wrap'>
                    <article className='resume-review-preview'>
                        <header><h2>{resume?.name || "Your Resume"}</h2><p>{resume?.email || resume?.suggestedRole || "Professional profile"}</p></header>
                        <div className='resume-preview-columns'>
                            <div><h3>Experience</h3>{(resume?.experience || []).slice(0, 3).map((item, index) => <div key={index} className='resume-preview-item'><strong>{item.role || item.company}</strong><span>{item.company}</span><p>{item.description}</p></div>)}</div>
                            <div><h3>Education</h3>{(resume?.education || []).slice(0, 2).map((item, index) => <div key={index} className='resume-preview-item'><strong>{item.degree}</strong><span>{item.college}</span><p>{item.year}</p></div>)}<h3 className='mt-6'>Skills</h3><p className='resume-preview-skills'>{(resume?.skills || []).slice(0, 12).join(" · ") || "Skills detected from your resume"}</p></div>
                        </div>
                    </article>
                </motion.div>

                <div className='resume-review-content'>
                    <div className='flex items-start justify-between gap-4'><div><p className='text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700'>AI analysis</p><h1 className='mt-1 text-2xl font-bold text-slate-800'>Resume Review</h1></div><button onClick={() => dispatch(setResume(null))} className='rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300'>Re-upload</button></div>

                    <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className='resume-score-card'>
                        <ScoreRing score={resume?.score || 0} />
                        <div className='flex-1'><h2>Your Resume Score</h2><p>This score is based on your resume structure, experience, skills, and role alignment.</p><div className='mt-3 flex items-center gap-2 text-xs font-semibold text-teal-700'><FiUser /> {resume?.suggestedRole || "Role recommendation pending"}</div></div>
                    </motion.article>

                    <article className='resume-insight-card'><div className='flex items-center gap-2'><FiAlertCircle className='text-teal-600' /><h2>What the AI found</h2></div><div className='resume-tag-group mt-4'>{(resume?.strengths || []).map((item) => <Tag key={item} text={item} color="green" />)}{!resume?.strengths?.length && <span className='text-xs text-slate-500'>Upload details will appear here after analysis.</span>}</div></article>
                    <article className='resume-insight-card'><div className='flex items-center gap-2'><FiZap className='text-rose-500' /><h2>Priority improvements</h2></div><div className='resume-tag-group mt-4'>{[...(resume?.weaknesses || []), ...(resume?.missingSkills || [])].map((item) => <Tag key={item} text={item} color="red" />)}{!resume?.weaknesses?.length && !resume?.missingSkills?.length && <span className='text-xs text-slate-500'>No critical gaps detected.</span>}</div></article>
                    <article className='resume-insight-card'><div className='flex items-center gap-2'><FiTrendingUp className='text-sky-600' /><h2>Recommended next steps</h2></div><div className='resume-tag-group mt-4'>{(resume?.recommendations || []).map((item) => <Tag key={item} text={item} color="blue" />)}{!resume?.recommendations?.length && <span className='text-xs text-slate-500'>Recommendations will appear after analysis.</span>}</div></article>
                </div>
            </section>
        </div>
    )
    //upload section
    return (
        <div className='theme-page min-h-screen text-[#171514]'>
            <Navbar label="Resume Scorer" />

            <section className='mx-auto grid min-h-screen w-full max-w-6xl items-center gap-5 px-4 pb-8 pt-20 md:px-6 lg:grid-cols-[.92fr_1.08fr] lg:gap-7'>
                <motion.div
                    initial={{ x: -24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.45 }}
                    className='relative overflow-hidden rounded-[1.75rem] border border-[#e6f7ae] bg-[#f7ffdf] p-4 shadow-[0_18px_45px_rgba(210,255,0,.08)] sm:p-6'>
                    <div className='absolute inset-0 bg-[linear-gradient(rgba(29,25,22,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(29,25,22,.035)_1px,transparent_1px)] bg-[size:32px_32px]' />
                    <div className='relative mb-4 flex items-start justify-between gap-4'>
                        <div>
                            <p className='text-[10px] font-bold uppercase tracking-[0.16em] text-[#819e00]'>Example résumé</p>
                            <h1 className='mt-1 text-xl font-bold tracking-tight text-[#171514] sm:text-2xl'>See what we analyze</h1>
                        </div>
                        <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#819e00] shadow-sm'><FiFileText /></div>
                    </div>

                    <article className='relative mx-auto rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-[0_16px_34px_rgba(44,33,27,.09)] sm:p-6'>
                        <header className='border-b border-[#ebe6e1] pb-4'>
                            <h2 className='text-lg font-bold text-[#171514]'>Shubham Bisht</h2>
                            <p className='mt-1 text-[11px] text-[#77716d]'>AI Engineer · Bengaluru, India</p>
                            <p className='mt-1 text-[10px] text-[#9a938e]'>aarav@example.com · github.com/aarav</p>
                        </header>
                        <div className='mt-4 grid grid-cols-[1.35fr_.65fr] gap-5'>
                            <div>
                                <h3 className='text-[9px] font-bold uppercase tracking-[0.14em] text-[#819e00]'>Experience</h3>
                                <div className='mt-2'><strong className='block text-[11px] text-[#2d2926]'>AI Intern</strong><span className='text-[9px] text-[#8b8581]'>Edunet Foundation · 2026</span><p className='mt-1 text-[9px] leading-4 text-[#77716d]'>Engineered highly accessible, user-centric web interfaces by deploying intelligent AI features, achieving strict alignment with WCAG compliance standards.</p></div>
                                <h3 className='mt-4 text-[9px] font-bold uppercase tracking-[0.14em] text-[#819e00]'>Projects</h3>
                                <div className='mt-2'><strong className='block text-[11px] text-[#2d2926]'>Job Search Dashboard</strong><p className='mt-1 text-[9px] leading-4 text-[#77716d]'>React, Node.js and analytics visualization.</p></div>
                            </div>
                            <div>
                                <h3 className='text-[9px] font-bold uppercase tracking-[0.14em] text-[#819e00]'>Education</h3>
                                <p className='mt-2 text-[10px] font-semibold text-[#2d2926]'>BCA</p><p className='text-[9px] leading-4 text-[#77716d]'>Dehradun Institute of Technology · 2024 -27</p>
                                <h3 className='mt-4 text-[9px] font-bold uppercase tracking-[0.14em] text-[#819e00]'>Skills</h3>
                                <div className='mt-2 flex flex-wrap gap-1'>{["Python", "Node.js", "Javascript", "React", "Sql", "MongoDB"].map((skill) => <span key={skill} className='rounded bg-[#f6ffd9] px-1.5 py-1 text-[8px] font-semibold text-[#667b00]'>{skill}</span>)}</div>
                            </div>
                        </div>
                    </article>

                    <div className='relative mt-4 grid grid-cols-3 gap-2 text-[9px] font-semibold text-[#6f6661]'>
                        <span className='flex items-center gap-1'><FiCheckCircle className='text-[#819e00]' /> Structure</span>
                        <span className='flex items-center gap-1'><FiCheckCircle className='text-[#819e00]' /> Keywords</span>
                        <span className='flex items-center gap-1'><FiCheckCircle className='text-[#819e00]' /> Impact</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.45, delay: 0.08 }}
                    className='glass-surface relative overflow-hidden p-5 sm:p-7'>
                    <div className='mb-5 flex items-start justify-between gap-4'>
                        <div><p className='text-[10px] font-bold uppercase tracking-[0.16em] text-[#819e00]'>Resume scorer</p><h2 className='mt-1 text-2xl font-bold tracking-[-0.03em] text-[#171514]'>Upload your résumé</h2><p className='mt-2 max-w-md text-sm leading-6 text-[#625f5c]'>Get an AI score with clear feedback on structure, skills, relevance, and improvements.</p></div>
                        <div className='hidden h-10 items-center gap-1.5 rounded-full border border-[#eee7e1] bg-white px-3 text-[10px] font-semibold text-[#77716d] sm:flex'><FiShield className='text-[#819e00]' /> Private PDF</div>
                    </div>

                    <label
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files?.[0]) }}
                        className={`relative flex min-h-56 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 text-center transition-all ${file ? "border-[#d2ff00] bg-[#f8ffe5]" : "border-[#e1d9d3] bg-[#fffdfb] hover:border-[#d2ff00] hover:bg-[#fbffed]"}`}>
                        <div className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl ${file ? "bg-[#d2ff00] text-[#171514]" : "bg-[#f6ffd9] text-[#819e00]"}`}>
                            {file ? <FiCheckCircle size={24} /> : <FiUploadCloud size={26} />}
                        </div>
                        <p className='max-w-full truncate text-sm font-semibold text-[#2d2926]'>{file ? file.name : "Drop your PDF here"}</p>
                        <p className='mt-1 text-xs text-[#8b8581]'>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze` : "or click to browse from your device"}</p>
                        <span className='mt-4 rounded-full border border-[#eee7e1] bg-white px-3 py-1 text-[10px] font-semibold text-[#77716d]'>PDF only · Maximum 20MB</span>
                        <input type='file' accept='.pdf,application/pdf' className='hidden' onChange={(event) => selectFile(event.target.files?.[0])} />
                    </label>

                    {fileError && <p className='mt-3 flex items-center gap-2 text-xs font-medium text-red-600'><FiAlertCircle /> {fileError}</p>}

                    <motion.button
                        whileHover={file ? { y: -2 } : {}}
                        whileTap={file ? { scale: 0.98 } : {}}
                        onClick={uploadResume}
                        disabled={!file || loading}
                        className='primary-gradient mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:grayscale disabled:opacity-40'>
                        <FiZap /> {loading ? "Analyzing…" : "Analyze résumé"}
                    </motion.button>
                    <p className='mt-3 text-center text-[10px] text-[#9a938e]'>Analysis uses 10 interview coins.</p>
                </motion.div>
            </section>




        </div>
    )
}

export default Scorer
