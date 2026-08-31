import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { FiArrowLeft, FiBarChart2, FiClock } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { getAllInterviews } from "../apis/interview.api"
import Brand from "../components/Brand"

function Feedback() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [interviews, setInterviews] = useState([])

  useEffect(() => {
    const loadFeedback = async () => {
      const result = await getAllInterviews()
      setInterviews((result?.interviews || []).filter((item) => item.status === "completed"))
      setLoading(false)
    }

    loadFeedback()
  }, [])

  return (
    <div className="theme-page flex flex-col">
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-20 border-b border-[#ebe6e1] bg-white/90 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center px-3 sm:px-5">
          <button
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
            className="mr-3 flex h-8 items-center gap-1.5 rounded-lg border border-[#ebe6e1] bg-white px-2.5 text-[#625f5c] transition hover:border-[#e2ff70] hover:text-[#708900]"
          >
            <FiArrowLeft size={15} />
            <span className="hidden text-xs font-medium sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <Brand className="text-sm font-extrabold text-[#0A0A0A] sm:text-base" markClassName="h-5 w-5" />
            <span className="hidden rounded bg-[#f6ffd9] px-1.5 py-0.5 text-[10px] text-[#667b00] sm:block">Interview Feedback</span>
          </div>
        </div>
      </motion.nav>

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl">

        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#819e00]">Interview history</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-[#171514] sm:text-4xl">Feedback reports</h1>
          <p className="mt-2 text-sm text-black/60">Open a completed interview to review its score and recommendations.</p>
        </div>

        {loading ? (
          <p className="text-sm text-black/60">Loading your interview reports…</p>
        ) : interviews.length === 0 ? (
          <div className="glass-surface relative overflow-hidden p-8 text-center sm:p-12">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[#f6ffd9] text-[#819e00] shadow-[0_8px_20px_rgba(210,255,0,.12)]">
              <FiBarChart2 size={24} />
            </div>
            <h2 className="font-semibold">No completed interviews yet</h2>
            <p className="mt-2 text-sm text-black/60">Finish an interview to see its feedback report here.</p>
            <button onClick={() => navigate("/interview")} className="primary-gradient mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
              Start an interview
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {interviews.map((interview) => (
              <button
                key={interview._id}
                onClick={() => navigate(`/interview/${interview._id}/report`, {
                  state: { from: "/feedback" },
                })}
                className="flex items-center justify-between rounded-2xl border border-[#ebe6e1] bg-white/95 p-5 text-left shadow-[0_8px_24px_rgba(44,33,27,.045)] transition hover:-translate-y-0.5 hover:border-[#e2ff70] hover:shadow-[0_14px_30px_rgba(210,255,0,.09)]"
              >
                <div>
                  <h2 className="font-semibold">{interview.role}</h2>
                  <p className="mt-1 text-sm capitalize text-black/60">{interview.type} interview</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-black/45"><FiClock /> {new Date(interview.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="rounded-xl border border-[#e5ff86] bg-[#f6ffd9] px-4 py-2 text-center">
                  <p className="text-xs text-black/50">Score</p>
                  <p className="text-lg font-bold text-[#708900]">{interview.overallScore ?? 0}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  )
}

export default Feedback
