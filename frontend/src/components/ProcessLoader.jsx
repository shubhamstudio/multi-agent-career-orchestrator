import { FiBarChart2, FiFileText, FiMap, FiMic } from "react-icons/fi"

const processIcons = {
  resume: FiFileText,
  interview: FiMic,
  report: FiBarChart2,
  roadmap: FiMap,
}

function ProcessLoader({ type = "resume", title = "Preparing your workspace", description = "This will only take a moment." }) {
  const Icon = processIcons[type] || FiFileText

  return (
    <div className="theme-page flex min-h-screen items-center justify-center p-5">
      <div className="theme-surface w-full max-w-sm p-7 text-center">
        <div className="relative mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#606BEB]/10 text-[#606BEB]">
          <span className="absolute inset-0 rounded-2xl border-2 border-[#606BEB]/30 border-t-[#606BEB] animate-spin" />
          <Icon size={24} />
        </div>
        <h1 className="text-xl font-bold leading-7 tracking-normal text-[#101828] [word-spacing:0.08em]">{title}</h1>
        <p className="mt-2.5 text-sm leading-6 tracking-normal text-[#667085]">{description}</p>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#edf2ff]">
          <div className="process-loader-bar h-full w-1/2 rounded-full bg-[#606BEB]" />
        </div>
      </div>
    </div>
  )
}

export default ProcessLoader
