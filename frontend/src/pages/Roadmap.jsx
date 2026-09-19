import { AnimatePresence, motion } from "motion/react"
import { FiArrowLeft, FiCheck, FiChevronDown, FiClock, FiFileText, FiSend, FiTrash2, FiX, FiZap } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { BsRocketTakeoff } from "react-icons/bs";
import { spendCoins } from '../apis/user.api'
import api from '../utils/axios'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import RoadmapResult from '../components/roadmap/RoadmapResult'
import Brand from '../components/Brand'
import { useCreditConfirmation } from '../contexts/CreditConfirmationContext'
const PACKAGE_OPTIONS = ["10 LPA", "15 LPA", "20 LPA", "30 LPA", "40 LPA"];
const ROLE_SUGGESTIONS = ["Frontend Dev", "Backend Eng", "Data Analyst", "ML Engineer"];
/* eslint-disable react-hooks/set-state-in-effect */
function Roadmap({ setUser }) {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const requestedRoadmapId = searchParams.get("id")
    const [historyOpen, setHistoryOpen] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [role, setRole] = useState("");
    const [targetPackage, setTargetPackage] = useState(PACKAGE_OPTIONS[2]); // default "20 LPA"
    const [packageOpen, setPackageOpen] = useState(false);
    const [useResume, setUseResume] = useState(false);
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");
    const { confirmCreditSpend } = useCreditConfirmation()

    const { resume } = useSelector((state) => state.resume)


    const getAllRoadmaps = async () => {
            setHistoryLoading(true)
            try {
                const response = await api.get("/api/roadmap/all")
                console.log(response.data)
                setHistory(response.data.data)
                setHistoryLoading(false)
            } catch (error) {
                console.log(error)
                setHistoryLoading(false)
            }
        }


    const getRoadmapById = async (id) => {
        try {
            const response = await api.get(`/api/roadmap/${id}`)
            console.log(response.data)
            setRoadmap(response.data.data)
        } catch (error) {
            console.log(error)
        }
    }

    const updateTopicProgress = async (topicId, status) => {
        try {
            const response = await api.patch(`/api/roadmap/${roadmap._id}/topics/${topicId}/progress`, { status })
            setRoadmap(response.data.data)
            setError("")
        } catch (error) {
            const message = error.response?.data?.message || "Failed to update topic progress."
            setError(message)
            throw error
        }
    }

    const deleteRoadmap = async (roadmapToDelete) => {
        if (!window.confirm(`Delete “${roadmapToDelete.title}”? This cannot be undone.`)) return
        try {
            await api.delete(`/api/roadmap/${roadmapToDelete._id}`)
            setHistory((current) => current.filter((item) => item._id !== roadmapToDelete._id))
            if (roadmap?._id === roadmapToDelete._id) {
                setRoadmap(null)
                navigate("/roadmap", { replace: true })
            }
            setError("")
        } catch (error) {
            setError(error.response?.data?.message || "Failed to delete roadmap.")
        }
    }

    useEffect(() => {
        getAllRoadmaps()
        if (requestedRoadmapId) getRoadmapById(requestedRoadmapId)
    }, [requestedRoadmapId])


    const handleGenerate = async () => {
        if (!role.trim() || loading) return;
        const approved = await confirmCreditSpend({ coins: 20, action: 'roadmap-builder' })
        if (!approved) return
        setLoading(true);
        setError("");
        try {
            try {
            const coinResponse = await spendCoins({ coins: 20, action: "roadmap-builder" })
                setUser((prev) => ({
                    ...prev, interviewCoin: coinResponse?.interviewCoin,
                }))
            } catch {
                setLoading(false)
                alert("Failed to use coins.")
                return;
            }

            const response = await api.post("/api/roadmap/generate", {
                role: role.trim(),
                targetPackage,
                useResume,
                resume
            })
            setRoadmap(response.data.data)
getAllRoadmaps()
            setLoading(false)

        } catch (error) {
            console.error("Failed to generate roadmap:", error);
            setError(error.response?.data?.message || "Something went wrong while generating your roadmap. Please try again.");
            setLoading(false)

        }
    }


    return (
        <div className='theme-page flex flex-col'>
            <motion.nav
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className='sticky top-0 z-20 border-b border-[#ebe6e1] bg-white/90 backdrop-blur-xl'>
                <div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-5'>
                    <div className='flex items-center gap-3'>
                      <button onClick={() => navigate("/dashboard")} aria-label="Back to dashboard" className='flex h-8 items-center gap-1.5 rounded-lg border border-[#ebe6e1] bg-white px-2.5 text-[#625f5c] transition hover:border-[#e2ff70] hover:text-[#708900]'>
                        <FiArrowLeft size={15} /><span className='hidden text-xs font-medium sm:inline'>Back</span>
                      </button>
                      <div className='flex items-center gap-1.5'>
                        <Brand className='text-sm font-extrabold sm:text-base text-[#0A0A0A]' markClassName='h-5 w-5' />
                        <span className='hidden rounded bg-[#f6ffd9] px-1.5 py-0.5 text-[10px] text-[#667b00] sm:block'>Roadmap Builder</span>
                      </div>
                    </div>

                    <button onClick={() => setHistoryOpen(!historyOpen)} className='flex h-8 items-center justify-center gap-1 rounded-lg border border-[#c6ee00] bg-[#d2ff00] px-2.5 text-[10px] font-semibold text-[#273000] transition hover:border-[#a7cc00] hover:bg-[#c6ee00]'>
                        <FiClock />
                        <span className="hidden sm:inline">History</span>
                    </button>

                </div>

            </motion.nav>

            <main className='flex-1 overflow-y-auto pb-28 pt-10 sm:pb-32 sm:pt-14'>
                <div className='max-w-3xl mx-auto px-3 sm:px-4 pt-5 sm:pt-6'>
                    <AnimatePresence mode='wait'>
                        {!roadmap ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.4 }}
                                className='flex flex-col items-center justify-center min-h-[60vh] text-center px-2 sm:px-4'>
                                <div className='relative mb-5 grid h-20 w-20 place-items-center rounded-[1.65rem] border border-[#e5ff86] bg-[#f6ffd9] shadow-[0_14px_32px_rgba(210,255,0,.16)] sm:mb-6'>
                                    <div className='absolute -bottom-4 h-8 w-8 rounded-full bg-[#d2ff00]/25 blur-xl' />
                                    <BsRocketTakeoff className='relative text-4xl text-[#d2ff00] sm:text-[42px]' />

                                </div>

                                <p className='mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#819e00]'>Career launchpad</p>
                                <h3 className='mb-2 text-2xl font-bold tracking-[-0.035em] text-[#171514] sm:text-3xl'>AI Roadmap Generator</h3>

                                <p className='text-black/45 text-sm max-w-xs sm:max-w-md mb-1'> Generate a personalised roadmap for your dream job.</p>

                                <p className='text-black/35 text-xs sm:text-sm max-w-xs sm:max-w-md'>
                                    Choose a role and let AI build a complete learning path.
                                </p>

                                {error && <p className="mt-4 text-xs text-red-500 max-w-xs sm:max-w-md">{error}</p>}

                                <div className='mt-7 grid w-full max-w-sm grid-cols-2 gap-2 sm:mt-8 sm:gap-3'>
                                    {
                                        ROLE_SUGGESTIONS.map((r) => (
                                            <motion.button
                                                key={r}
                                                onClick={() => setRole(r)}
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 0.97 }}
                                                className='relative overflow-hidden rounded-xl border border-[#ebe6e1] bg-white px-2 py-2 text-xs font-medium text-[#625f5c] shadow-[0_6px_16px_rgba(44,33,27,.05)] transition-all hover:border-[#e2ff70] hover:bg-[#f8ffe5] hover:text-[#708900] sm:px-3 sm:py-2.5'>
                                                <span className='relative'>{r}</span>

                                            </motion.button>
                                        ))
                                    }
                                </div>

                            </motion.div>
                        ) : (
                            <div>
                                {error && <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
                                <RoadmapResult
                                roadmap={roadmap}
                                onClear={()=>setRoadmap(null)}
                                onProgress={updateTopicProgress}
                                onDelete={() => deleteRoadmap(roadmap)}
                                />
                            </div>

                        )}


                    </AnimatePresence>
                </div>

            </main>

            <div className='fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#fbfaf8] via-[#fbfaf8]/95 to-transparent px-3 pb-3 pt-3 sm:px-4 sm:pb-4'>
                <div className='max-w-3xl mx-auto'>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className='relative flex items-center gap-1.5 overflow-visible rounded-xl border border-[#ebe6e1] bg-white/95 p-1.5 shadow-[0_12px_30px_rgba(44,33,27,.10)] backdrop-blur-xl sm:gap-2 sm:rounded-2xl sm:p-2'>

                        <input
                            type='text'
                            placeholder='Backend Developer'
                            onChange={(e) => setRole(e.target.value)}
                            value={role}
                            className='relative min-w-0 flex-1 bg-transparent px-2 py-1.5 text-xs text-[#171514] outline-none placeholder:text-[#aaa29c] sm:text-sm' />

                        <div className='relative'>
                            <motion.button
                                type='button'
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setPackageOpen(!packageOpen)}
                                className='relative flex whitespace-nowrap items-center gap-1 rounded-xl border border-[#eee7e1] bg-[#fbffed] px-2.5 py-2 text-xs text-[#625f5c] transition-all hover:border-[#e2ff70] hover:text-[#708900]'>
                                {targetPackage}
                                <FiChevronDown size={11} className={`transition-transform ${packageOpen ? "rotate-180" : ""}`} />


                            </motion.button>

                            <AnimatePresence>
                                {packageOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className='absolute bottom-full right-0 z-10 mb-4 w-28 overflow-hidden rounded-xl border border-[#ebe6e1] bg-white shadow-[0_12px_28px_rgba(44,33,27,.14)]'>
                                        {
                                            PACKAGE_OPTIONS.map((pkg) => (
                                                <button key={pkg}
                                                    onClick={() => {
                                                        setTargetPackage(pkg);
                                                        setPackageOpen(false)
                                                    }}
                                                    className={`w-full text-left text-xs px-3 py-2 transition-colors ${pkg === targetPackage
                                                        ? "bg-[#f6ffd9] text-[#708900]"
                                                        : "text-[#625f5c] hover:bg-[#fbffed] hover:text-[#708900]"
                                                        }`}>
                                                    {pkg}

                                                </button>
                                            ))
                                        }

                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type='button'
                            onClick={() => setUseResume(!useResume)}
                            className={`flex items-center text-xs gap-1 px-2 py-2 rounded-xl ${useResume
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-[#fbffed] text-[#625f5c]"
                                }`}>
                            {useResume ? (
                                <>
                                    <FiCheck size={12} />
                                    Added
                                </>
                            ) : (
                                <>
                                    <FiFileText size={12} />
                                    Resume
                                </>
                            )}

                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={loading || !role.trim()}
                            onClick={handleGenerate}
                            className='primary-gradient relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 sm:px-4'>
                            {loading ? (
                                <>
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="inline-block"
                                    >
                                        <FiZap size={12} />
                                    </motion.span>
                                    <span className="hidden sm:inline">Generating…</span>
                                </>
                            ) : (
                                <>
                                    <FiSend size={12} />
                                    <span className="hidden sm:inline">Generate</span>
                                </>
                            )}

                        </motion.button>


                    </motion.div>

                </div>
            </div>

            <AnimatePresence>
                {
                    historyOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setHistoryOpen(false)}
                                className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm' />

                            <motion.aside
                                initial={{ x: 320 }}
                                animate={{ x: 0 }}
                                exit={{ x: 320 }}
                                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                                className='fixed bottom-0 right-0 top-0 z-50 flex w-[280px] max-w-[85vw] flex-col overflow-y-auto border-l border-[#ebe6e1] bg-white shadow-[0_0_40px_rgba(44,33,27,.1)] sm:w-[300px]'>
                                <div className='sticky top-0 flex items-center justify-between border-b border-[#ebe6e1] bg-white/95 px-4 py-3 backdrop-blur-xl sm:py-4'>
                                    <span className='text-sm font-semibold text-[#0A0A0A]'>Previous Roadmaps</span>
                                    <button onClick={() => setHistoryOpen(false)} className='text-black/35 hover:text-[#0A0A0A] transition-colors'><FiX size={16} /></button>
                                </div>

                                <div className='flex flex-col gap-2 p-3'>
                                    {historyLoading ? (
                                        <p className="text-xs text-black/35 text-center py-6">Loading…</p>
                                    )
                                        : history.length === 0 ?
                                            (
                                                <p className="text-xs text-black/35 text-center py-6">No roadmaps yet.</p>
                                            ) :
                                            (
                                                history.map((h, i) => (
                                                    <div key={i} className='group relative overflow-hidden rounded-xl border border-[#ebe6e1] bg-[#fbffed] transition hover:border-[#e2ff70] hover:bg-white'>
                                                    <button onClick={()=>{
                                                        getRoadmapById(h._id);
                                                        setHistoryOpen(false)
                                                    }} className='w-full cursor-pointer p-4 pr-11 text-left'>
                                                        <h3 className='font-semibold text-[#171514]'>{h.title}</h3>
                                                        <div className='flex justify-between items-center my-1'>
                                                            <span className='text-xs text-[#708900]'>{h.targetPackage}</span>
                                                            <p className='text-xs text-[#8b8581]'>{h.duration}</p>
                                                        </div>

                                                        <p className='mt-1 text-xs text-[#9a938e]'>
                                                        {new Date(h.createdAt).toLocaleDateString()}</p>
                                                    </button>
                                                    <button type="button" onClick={() => deleteRoadmap(h)} aria-label={`Delete ${h.title}`} title="Delete roadmap" className='absolute right-3 top-3 grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-[#9a938e] opacity-70 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100'><FiTrash2 size={13} /></button>
                                                    </div>
                                                ))
                                            )}
                                </div>


                            </motion.aside>

                        </>
                    )
                }
            </AnimatePresence>




        </div>
    )
}

export default Roadmap
