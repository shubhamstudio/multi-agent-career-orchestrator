function ResumeScanVisual({ compact = false }) {
  return (
    <div className={`resume-scan-visual ${compact ? "resume-scan-visual--compact" : ""}`} aria-hidden="true">
      <img src="/images/resume_03.png" alt="" />
      <span className="resume-scan-line" />
      <span className="resume-scan-glow" />
    </div>
  )
}

export default ResumeScanVisual
