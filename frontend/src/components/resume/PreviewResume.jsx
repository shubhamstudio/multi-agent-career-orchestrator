import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { FiArrowLeft, FiEdit3, FiCheck } from 'react-icons/fi'
import DownloadBtn from './DownloadBtn'
import ClassicCompactTemplate from './ClassicCompactTemplate'
import SplitHeaderTemplate from './SplitHeaderTemplate'

function PreviewResume({ data, setData, templateId, onBack, onChangeTemplate, setUser }) {
    const resumeRef = useRef(null)
    const [scale, setScale] = useState(1)
    const [editing, setEditing] = useState(templateId === 'ai-generated')

    useEffect(() => {
        const updateScale = () => {
            const paperWidth = 816; // 8.5in at the CSS print resolution
            const availableWidth = Math.max(280, window.innerWidth - 24);
            setScale(Math.min(0.9, availableWidth / paperWidth));
        };

        updateScale();

        window.addEventListener("resize", updateScale);

        return () =>
            window.removeEventListener("resize", updateScale);

    }, [])

    return (
        <div className='min-h-screen bg-white text-[#0A0A0A]'>
            {/* header */}
            <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className='sticky top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl'>
                <div className='mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
                    <div>
                        <h2 className='text-base font-bold sm:text-lg'>Resume Preview</h2>
                        <p className='mt-0.5 text-[10px] text-gray-400 sm:text-xs'>
                            Review your resume before downloading
                        </p>
                    </div>

                    <div className='flex items-center justify-between lg:justify-end gap-2.5'>
                        <button onClick={onChangeTemplate} className='hidden h-8 items-center justify-center rounded-lg border border-black/15 px-2.5 text-xs text-black/60 transition hover:border-black/35 hover:text-[#0A0A0A] sm:flex'>Change template</button>
                        <button onClick={() => setEditing((current) => !current)} className={`flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs transition ${editing ? 'border-[#819e00] bg-[#f6ffd9] text-[#597000]' : 'border-black/15 text-black/60 hover:border-black/35 hover:text-[#0A0A0A]'}`}>
                            {editing ? <FiCheck size={14} /> : <FiEdit3 size={14} />} <span className='hidden sm:inline'>{editing ? 'Done editing' : 'Edit text'}</span>
                        </button>
                        <button onClick={onBack} className='flex h-8 items-center justify-center gap-1.5 rounded-lg border border-black/15 px-2.5 sm:px-3 text-xs text-black/60 transition hover:border-black/35 hover:text-[#0A0A0A]'>
                            <FiArrowLeft size={15} />
                            <span className='hidden sm:block'>Back to Edit</span>

                        </button>
                        <DownloadBtn docRef={resumeRef} setUser={setUser} />
                    </div>


                </div>
            </motion.div>


            {/* Template */}
            <div className='overflow-auto bg-[#F8F9FA] px-3 py-4 sm:px-6 sm:py-8'>
                <div className='mx-auto flex justify-center'>
                    <div style={{
                        width: `${816 * scale}px`,
                        minHeight: `${1056 * scale}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: "top center"
                    }}
                    >
                        <div ref={resumeRef} className='rounded-md bg-white shadow-[0_0_50px_rgba(0,0,0,.6)]'>
                            {templateId === 'split-header'
                                ? <SplitHeaderTemplate data={data} editable={editing} onChange={setData} />
                                : <ClassicCompactTemplate data={data} editable={editing} onChange={setData} />}
                        </div>

                    </div>

                </div>

            </div>



        </div>
    )
}

export default PreviewResume
