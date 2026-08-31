import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { FiBookOpen, FiCheckCircle, FiClock, FiExternalLink, FiMap, FiPlay, FiTarget, FiTrash2, FiX } from "react-icons/fi";
import RoadmapCanvas from "./RoadmapCanvas";

const statusLabels = {
  locked: "Locked",
  available: "Ready to start",
  "in-progress": "In progress",
  completed: "Completed",
};

const emptyTopics = [];

function RoadmapResult({ roadmap, onClear, onProgress, onDelete }) {
  const [selectedId, setSelectedId] = useState(roadmap.nodes?.[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const moduleDetailsRef = useRef(null);
  const topics = roadmap.nodes || emptyTopics;
  const selectedTopic = topics.find((topic) => topic.id === selectedId) || topics[0];
  const isLegacy = roadmap.templateSlug === "legacy-generated";

  const progress = useMemo(() => {
    const required = topics.filter((topic) => topic.type !== "optional");
    if (!required.length) return 0;
    return Math.round((required.filter((topic) => topic.status === "completed").length / required.length) * 100);
  }, [topics]);

  const nextAction = selectedTopic?.status === "completed"
    ? { label: "Reopen topic", status: "in-progress" }
    : selectedTopic?.status === "in-progress"
      ? { label: "Mark completed", status: "completed" }
      : { label: "Start topic", status: "in-progress" };

  const handleProgress = async () => {
    if (!selectedTopic || selectedTopic.status === "locked" || isLegacy || saving) return;
    setSaving(true);
    try {
      await onProgress(selectedTopic.id, nextAction.status);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTopic = (topicId) => {
    setSelectedId(topicId);
    window.setTimeout(() => {
      moduleDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-5 overflow-hidden rounded-2xl border border-[#ebe6e1] bg-white p-5 shadow-[0_12px_30px_rgba(44,33,27,.07)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#f6ffd9] via-transparent to-transparent" />
        <div className="relative mb-4 flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-[#819e00]">Your Roadmap</p>
            <h2 className="text-xl font-bold text-[#171514]">{roadmap.title}</h2>
            <p className="mt-0.5 text-sm text-[#77716d]">Target: <span className="font-medium text-[#708900]">{roadmap.targetPackage}</span></p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onDelete} aria-label="Delete roadmap" title="Delete roadmap" className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#9a938e] transition-colors hover:bg-red-50 hover:text-red-600"><FiTrash2 size={15} /></button>
            <button onClick={onClear} aria-label="Close roadmap" title="Close roadmap" className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#9a938e] transition-colors hover:bg-[#f6ffd9] hover:text-[#708900]"><FiX size={16} /></button>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: FiTarget, label: "Difficulty", value: roadmap.level },
            { icon: FiClock, label: "Duration", value: roadmap.duration },
            { icon: FiCheckCircle, label: "Topics", value: topics.length },
            { icon: FiMap, label: "Progress", value: `${progress}%` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-[#eee7e1] bg-[#fbffed] p-3">
              <div className="mb-1 flex items-center gap-1.5"><Icon size={11} className="text-[#819e00]" /><span className="text-xs text-[#8b8581]">{label}</span></div>
              <p className="text-sm font-semibold text-[#171514]">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mb-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8b8581]"><FiMap size={12} className="text-[#819e00]" /> Learning Path</p>
          <div className="flex items-center gap-3 text-[10px] text-[#8b8581]">
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#d2ff00]" />Ready</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#71d4a8]" />Completed</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#d9d4cf]" />Locked</span>
          </div>
        </div>
        <RoadmapCanvas topics={topics} roadmapEdges={roadmap.edges || []} onSelect={handleSelectTopic} />
      </div>

      {selectedTopic && (
        <motion.section
          ref={moduleDetailsRef}
          key={selectedTopic.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-5 scroll-mt-20 overflow-hidden rounded-2xl border border-[#ebe6e1] bg-white p-5 shadow-[0_10px_26px_rgba(44,33,27,.06)]"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-[#d2ff00]" />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#819e00]">
                <span>{selectedTopic.section}</span>
                <span className="rounded-full bg-[#f6ffd9] px-2 py-0.5 normal-case tracking-normal text-[#708900]">{selectedTopic.type}</span>
                <span className="normal-case tracking-normal text-[#9a938e]">{statusLabels[selectedTopic.status]}</span>
              </div>
              <h3 className="text-base font-semibold text-[#171514]">{selectedTopic.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#625f5c]">{selectedTopic.description}</p>
              {selectedTopic.aiReason && <p className="mt-2 rounded-lg bg-[#fbffed] px-3 py-2 text-xs text-[#708900]">Why this matters: {selectedTopic.aiReason}</p>}
            </div>
            {!isLegacy && (
              <button
                type="button"
                onClick={handleProgress}
                disabled={selectedTopic.status === "locked" || saving}
                className="primary-gradient flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:grayscale disabled:opacity-40"
              >
                {selectedTopic.status === "completed" ? <FiCheckCircle size={12} /> : <FiPlay size={12} />}
                {saving ? "Saving…" : nextAction.label}
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-[#eee7e1] bg-[#fbffed] px-2.5 py-1.5 text-[11px] text-[#625f5c]">{selectedTopic.difficulty}</span>
            <span className="rounded-lg border border-[#eee7e1] bg-[#fbffed] px-2.5 py-1.5 text-[11px] text-[#625f5c]">{selectedTopic.duration}</span>
          </div>

          {(selectedTopic.resources || []).length > 0 && (
            <div className="mt-4 rounded-xl border border-[#dfea9b] bg-[#fbffed] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#536800]">
                  <FiBookOpen size={13} /> Recommended documentation
                </p>
                <p className="text-[10px] text-[#708900]">Click a resource below to start learning ↗</p>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {selectedTopic.resources.map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${item.title} in a new tab`}
                    className="group flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#d8e77a] bg-white px-3 py-2 text-[11px] font-medium text-[#536800] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b9d700] hover:shadow-[0_6px_16px_rgba(129,158,0,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9d700]"
                  >
                    <span className="underline decoration-[#c9dc61] underline-offset-2 group-hover:decoration-[#708900]">{item.title}</span>
                    <FiExternalLink size={11} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}
    </motion.div>
  );
}

export default RoadmapResult;
