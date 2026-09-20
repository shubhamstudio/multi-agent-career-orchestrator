import { motion } from "motion/react"
import { FiArrowLeft, FiArrowRight, FiBriefcase, FiCheck, FiCheckCircle, FiFileText, FiUploadCloud } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { spendCoins } from '../../apis/user.api'
import api from '../../utils/axios'
import { setResume } from '../../redux/resumeSlice'
import { startInterview } from '../../apis/interview.api'
import { uploadUserFile } from '../../apis/blobUpload.api'
import ResumeScanVisual from '../ResumeScanVisual'
import { primeDeepgramAudio } from '../../utils/deepgramFluxTts'
import { useCreditConfirmation } from '../../contexts/CreditConfirmationContext'
import { useFeedback } from '../../contexts/FeedbackContext'
function Step1setup({ user, setUser }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { resume } = useSelector((state) => state.resume)
    const [role, setRole] = useState("");
    const [type, setType] = useState("technical");
    const [useResume, setUseResume] = useState(!!resume)
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [starting, setStarting] = useState(false)
    const { confirmCreditSpend } = useCreditConfirmation()
    const { notify } = useFeedback()

    const uploadResume = async () => {
        if (!file) {
            notify("Choose a PDF before uploading it.", { type: 'info', title: 'Resume needed' })
            return
        }
        const approved = await confirmCreditSpend({ coins: 10, action: 'resume-scorer' })
        if (!approved) return
        try {
            setUploading(true)
            try {
                
            const coinResponse = await spendCoins({ coins: 10, action: "resume-scorer" })

            setUser((prev) => ({
                ...prev, interviewCoin: coinResponse?.interviewCoin,
            }))
            } catch {
                setUploading(false)
                notify("We could not reserve your credits. Please try again.", { type: 'error' })
                return;
            }


            const blob = await uploadUserFile({ kind: "resume", file, filename: file.name })
            const response = await api.post("/api/resume/process", {
                blobUrl: blob.url,
                filename: file.name,
            }, { timeout: 300000 })

            dispatch(setResume(response?.data?.data))
            notify("Your résumé is ready to personalize the interview.", { type: 'success', title: 'Resume uploaded' })
            setUploading(false)
            setFile(null)
        } catch (error) {
            console.error("Resume upload failed:", error.response?.data || error)
            notify(error.response?.data?.message || "We could not upload that résumé. Please try again.", { type: 'error', title: 'Upload failed' })
            setUploading(false)
        }
    }

    const start = async () => {
        primeDeepgramAudio().catch(() => {})
        const approved = await confirmCreditSpend({ coins: 50, action: 'start-interview' })
        if (!approved) return
        setStarting(true)
        try {
            const response = await startInterview({ role: role.trim(), type, useResume, resume })
            if (!response?.success) {
                throw new Error(response?.message || "Interview setup failed.")
            }

            try {
                const coinResponse = await spendCoins({ coins: 50, action: "start-interview" })

                setUser((prev) => ({
                    ...prev, interviewCoin: coinResponse?.interviewCoin,
                }))
            } catch {
                notify("We could not reserve your credits. Please try again.", { type: 'error' })
                return
            }

            navigate(`/interview/${response.interviewId}`)
        } catch (error) {
            console.error("Interview start failed:", error.response?.data || error)
            notify(error.response?.data?.message || error.message || "We could not start the interview. Please try again.", { type: 'error', title: 'Interview unavailable' })
        } finally {
            setStarting(false)
        }
    }

    return (
        <div className='theme-page flex items-center justify-center p-3 sm:p-5'>
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className='w-full max-w-4xl theme-dark-surface overflow-hidden grid lg:grid-cols-[40%_60%]'>

                {/* left */}

                <div className='p-5 sm:p-7 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-start gap-4'>

                    <div>
                        <div onClick={() => navigate("/dashboard")} className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 cursor-pointer'>
                            <FiArrowLeft size={12} />
                            <span className='text-xs text-zinc-300'>Back</span>
                        </div>
                        <h2 className='mt-4 text-xl sm:text-2xl font-bold text-white leading-snug'>
                            Welcome back,<br />
                            {user?.name}
                        </h2>

                        <p className='mt-2 text-xs sm:text-sm leading-6 text-zinc-400'>
                            Practice realistic AI interviews, receive instant feedback,
                            and improve before your next job interview.
                        </p>
                    </div>

                    <div className='space-y-2 sm:space-y-3'>
                        {[
                            "Personalized AI Questions",
                            "Resume Based Interview",
                            "Detailed Performance Report",
                            "Real Interview Experience",
                        ].map((item, index) => (
                            <motion.div key={index} whileHover={{ x: 4 }} className='flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3'>
                                <div className='w-7 h-7 shrink-0 rounded-lg bg-white flex items-center justify-center'><FiCheck className='text-black' size={13} /></div>
                                <span className='text-xs sm:text-sm text-zinc-300'>{item}</span>

                            </motion.div>
                        ))

                        }
                    </div>

                </div>

                {/* right */}
                <div className='p-5 sm:p-7 flex flex-col'>
                    <div>
                        <h2 className='text-lg sm:text-xl font-semibold text-white'>
                            Start Interview
                        </h2>
                        <p className='mt-1 text-xs text-zinc-500'>
                            Configure your interview preferences.
                        </p>
                    </div>

                    <div className='mt-5 flex-1 space-y-4 overflow-y-auto'>

                        {/* role */}
                        <div>
                            <label className='text-xs font-medium text-zinc-400'>Target Role</label>
                            <div className='mt-1.5 relative'>
                                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                                <input type="text"
                                    onChange={(e) => setRole(e.target.value)}
                                    value={role}
                                    placeholder='Backend Developer'
                                    className='w-full h-11 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 pl-10 pr-4 text-sm text-white outline-none focus:border-[#8e98ff] transition' />
                            </div>
                        </div>

                        {/* type */}

                        <div>
                            <label className='text-xs font-medium text-zinc-400'>Interview Type</label>
                            <div className='mt-1.5 flex rounded-xl bg-white/[0.06] backdrop-blur-md p-1 border border-white/10'>
                                {
                                    ["technical", "hr"].map((item) => (
                                        <button key={item}
                                            onClick={() => setType(item)}
                                            className={`flex-1 h-9 rounded-lg text-xs sm:text-sm font-medium capitalize transition-all ${type === item ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                                                }`} >
                                            {item}
                                        </button>
                                    ))
                                }

                            </div>
                        </div>

                        {/* resume toggle */}

                        <div className='rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-md p-4'>
                            <div className='flex items-center justify-between '>
                                <div>
                                    <h2 className='text-sm font-medium text-white'>Use Resume</h2>
                                    <p className='mt-0.5 text-xs text-zinc-500'>
                                        AI will personalize questions using your resume.
                                    </p>
                                </div>
                                <button onClick={() => setUseResume(!useResume)} className={`relative shrink-0 w-12 h-7 rounded-full transition ${useResume ? "bg-white" : "bg-zinc-700"}`}>
                                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-black transition-all ${useResume ? "left-5.5" : "left-0.5"}`} />
                                </button>


                            </div>

                        </div>


                        {resume && useResume && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}

                                className='rounded-xl border border-green-500/20 bg-green-500/5 p-4'>
                                <div className='flex items-center gap-3'>

                                    <div className='w-9 h-9 shrink-0 rounded-lg bg-green-500 flex items-center justify-center'>
                                        <FiFileText size={15} className='text-white' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <h4 className='text-sm font-semibold text-white'>Resume Ready <span className='text-gray-400'>({resume?.suggestedRole})</span></h4>
                                        <p className='text-xs text-zinc-400'>
                                            Resume detected successfully.
                                        </p>
                                    </div>
                                    <FiCheckCircle size={18} className='text-green-400 shrink-0' />

                                </div>

                            </motion.div>
                        )}

                        {
                            useResume && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className='rounded-xl border-2 border-dashed border-white/10 bg-white/[0.06] backdrop-blur-md p-4'>

                                    <label className='cursor-pointer flex flex-col items-center'>
                                        <div className='w-11 h-11 rounded-xl bg-white flex items-center justify-center'><FiUploadCloud size={20} className='text-black' /></div>
                                        <h3 className='mt-3 text-sm font-semibold text-white'>Upload Resume</h3>
                                        <p className='mt-1 text-xs text-zinc-500 text-center'>
                                            {resume
                                                ? "Resume detected. Upload a new resume anytime to update your interview questions."
                                                : "Upload your resume to generate personalized interview questions."
                                            }
                                        </p>
                                        <input type="file" className='hidden' accept='.pdf'
                                            onChange={(e) => { if (e.target.files[0]) setFile(e.target.files[0]) }} />

                                    </label>

                                    {file && uploading && (
                                        <div className='mt-4 rounded-xl border border-[#606BEB]/30 bg-[#606BEB]/10 p-3'>
                                            <div className='flex items-center gap-3'>
                                                <ResumeScanVisual compact />
                                                <div>
                                                    <p className='text-xs font-semibold text-white'>Scanning your resume</p>
                                                    <p className='mt-1 text-[11px] text-zinc-400'>Personalizing the interview questions.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {file && !uploading && (
                                        <div className='mt-4'>
                                            <div className='flex items-center gap-2.5 rounded-lg bg-white/5 border border-white/10 p-2.5'>
                                                <img src='/images/pdf.png' alt='' className='h-7 w-7 object-contain' />
                                                <p className='text-xs text-zinc-300 truncate'>{file.name}</p>
                                            </div>

                                            <button
                                                onClick={uploadResume}
                                                disabled={uploading}
                                                className='mt-3 w-full h-10 rounded-xl bg-white text-black text-sm font-semibold hover:opacity-90 transition disabled:opacity-60'>
                                                {uploading ? "Uploading..." : "Upload"}
                                            </button>



                                        </div>
                                    )}

                                </motion.div>
                            )
                        }
                    </div>

                    <motion.button
                    onClick={start}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!role || starting || (useResume && !resume)}
                        className='mt-5 h-12 rounded-xl bg-white text-black text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition'>
                        {starting ? "Starting Interview..." : (
                            <>Start Interview <FiArrowRight size={15} /></>
                        )}

                    </motion.button>

                </div>


            </motion.div>


        </div>
    )
}

export default Step1setup
