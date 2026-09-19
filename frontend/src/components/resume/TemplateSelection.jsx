import { FiArrowLeft, FiCheck, FiFileText } from 'react-icons/fi';
import { motion } from 'motion/react';
import Brand from '../Brand';

const templates = [
  {
    id: 'classic-compact',
    name: 'Classic Compact',
    description: 'Centered header, compact sections, and a clean black-and-white hierarchy.',
    preview: 'classic',
  },
  {
    id: 'split-header',
    name: 'Professional Split Header',
    description: 'Left-aligned identity with structured contact details and subtle blue emphasis.',
    preview: 'split',
  },
  {
    id: 'ai-generated',
    name: 'AI-Generated Resume',
    description: 'Tailor an ATS-ready draft to a job description using your own verified details.',
    preview: 'classic',
  },
];

function TemplateMockup({ variant }) {
  const split = variant === 'split';
  return (
    <div className='h-40 w-full rounded-md border border-slate-200 bg-white p-3 shadow-sm'>
      <div className={`mb-2 border-b border-slate-800 pb-1 ${split ? 'flex justify-between text-left' : 'text-center'}`}>
        <div className={`h-2.5 w-20 bg-slate-900 ${split ? '' : 'mx-auto'}`} />
        {split && <div className='h-1.5 w-14 bg-blue-600' />}
        <div className={`mt-1 h-1 w-28 bg-slate-300 ${split ? '' : 'mx-auto'}`} />
      </div>
      {[1, 2, 3, 4].map((section) => (
        <div key={section} className='mb-2'>
          <div className='mb-1 h-1.5 w-16 border-b border-slate-700 bg-slate-700' />
          <div className='space-y-1'>
            <div className={`h-1 w-full ${split && section === 2 ? 'bg-blue-100' : 'bg-slate-200'}`} />
            <div className='h-1 w-[88%] bg-slate-200' />
            <div className='h-1 w-[72%] bg-slate-200' />
          </div>
        </div>
      ))}
    </div>
  );
}

function TemplateSelection({ onSelect, onBack }) {
  return (
    <div className='theme-page min-h-screen'>
      <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className='sticky top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl'>
        <div className='mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:px-5'>
          <button onClick={onBack} aria-label='Back to dashboard' className='flex h-8 items-center gap-1.5 rounded-lg border border-[#ebe6e1] bg-white px-2.5 text-[#625f5c] transition hover:border-[#e2ff70] hover:text-[#708900]'>
            <FiArrowLeft size={15} /><span className='hidden text-xs font-medium sm:inline'>Back</span>
          </button>
          <Brand className='text-sm font-extrabold text-[#0A0A0A]' markClassName='h-5 w-5' />
        </div>
      </motion.nav>

      <main className='mx-auto max-w-4xl px-4 py-10 sm:py-16'>
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#f6ffd9] text-[#708900]'><FiFileText size={18} /></div>
          <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-[#819e00]'>Resume Builder</p>
          <h1 className='mt-2 text-2xl font-bold tracking-tight text-[#171514] sm:text-3xl'>Choose your ATS-friendly template</h1>
          <p className='mx-auto mt-2 max-w-xl text-sm text-black/45'>Every option keeps content selectable and easy for applicant tracking systems to parse.</p>
        </div>

        <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {templates.map((template) => (
            <article key={template.id} className='rounded-2xl border border-[#e6e1db] bg-white p-4 shadow-[0_12px_30px_rgba(44,33,27,.06)]'>
              <TemplateMockup variant={template.preview} />
              <h2 className='mt-4 text-base font-semibold text-[#171514]'>{template.name}</h2>
              <p className='mt-1 min-h-10 text-xs leading-relaxed text-black/45'>{template.description}</p>
              <button onClick={() => onSelect(template.id)} className='mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-black'>
                <FiCheck size={14} /> {template.id === 'ai-generated' ? 'Create with AI' : 'Use this template'}
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default TemplateSelection;
