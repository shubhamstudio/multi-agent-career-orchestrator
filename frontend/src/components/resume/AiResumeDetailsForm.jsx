import { useState } from 'react';
import { FiArrowLeft, FiZap } from 'react-icons/fi';
import { motion } from 'motion/react';

const emptyBrief = {
  targetRole: '',
  jobDescription: '',
  yearsExperience: '',
  aboutYou: '',
};

function Field({ label, value, onChange, placeholder, textarea = false, required = false }) {
  const className = 'w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-[#171514] outline-none transition focus:border-[#819e00] focus:ring-2 focus:ring-[#e5ff86] placeholder:text-black/30';
  return (
    <label className='block'>
      <span className='mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-black/55'>{label}{required && <span className='text-red-500'> *</span>}</span>
      {textarea
        ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={5} className={`${className} resize-y`} />
        : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={className} />}
    </label>
  );
}

function AiResumeDetailsForm({ onBack, onGenerated }) {
  const [brief, setBrief] = useState(emptyBrief);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (field) => (value) => setBrief((current) => ({ ...current, [field]: value }));

  const generate = async (event) => {
    event.preventDefault();
    if (!brief.targetRole.trim() || !brief.jobDescription.trim() || !brief.yearsExperience.trim() || !brief.aboutYou.trim()) {
      setError('Your details, target role, years of experience, and the job description are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onGenerated(brief);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not generate the resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='theme-page min-h-screen'>
      <motion.header initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className='sticky top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl'>
        <div className='mx-auto flex h-14 max-w-4xl items-center px-3 sm:px-5'>
          <button onClick={onBack} className='flex h-8 items-center gap-1.5 rounded-lg border border-black/15 px-2.5 text-xs text-black/60 transition hover:border-black/35 hover:text-[#0A0A0A]'><FiArrowLeft size={15} /> Back to templates</button>
        </div>
      </motion.header>

      <main className='mx-auto max-w-4xl px-4 py-8 sm:py-12'>
        <div className='mb-7'>
          <div className='mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#f6ffd9] text-[#708900]'><FiZap size={18} /></div>
          <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-[#819e00]'>AI-generated resume</p>
          <h1 className='mt-2 text-2xl font-bold tracking-tight text-[#171514] sm:text-3xl'>Tell us the facts. AI will shape the presentation.</h1>
          <p className='mt-2 max-w-2xl text-sm text-black/45'>Write naturally—AI will structure it into a tailored resume without inventing employers, projects, qualifications, or results. You can edit every word in the preview.</p>
        </div>

        <form onSubmit={generate} className='space-y-6'>
          <section className='rounded-2xl border border-[#e6e1db] bg-white p-4 sm:p-5'>
            <h2 className='text-sm font-semibold'>Target role and job</h2>
            <div className='mt-4 grid gap-4 sm:grid-cols-2'>
              <Field label='Target role' value={brief.targetRole} onChange={update('targetRole')} placeholder='Backend Developer' required />
              <Field label='Years of experience' value={brief.yearsExperience} onChange={update('yearsExperience')} placeholder='2 years, including internships' required />
            </div>
            <div className='mt-4'><Field label='Job description' value={brief.jobDescription} onChange={update('jobDescription')} placeholder='Paste the job description or its key requirements…' textarea required /></div>
          </section>

          <section className='rounded-2xl border border-[#e6e1db] bg-white p-4 sm:p-5'>
            <h2 className='text-sm font-semibold'>Tell AI about yourself</h2>
            <p className='mt-1 text-xs leading-relaxed text-black/45'>Include any details you want on the resume: name, contact links, education, skills, internships, jobs, projects, achievements, certificates, dates, and measurable results.</p>
            <div className='mt-4'>
              <Field label='Your background' value={brief.aboutYou} onChange={update('aboutYou')} placeholder={'Example: I am Shubham Bisht from Dehradun. My email is … and LinkedIn is …\nI am a BCA student at … (2024–2027), with skills in …\nI built … using … and achieved …\nI interned at … as … from … to …'} textarea required />
            </div>
          </section>

          {error && <p className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>{error}</p>}
          <button disabled={loading} className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50'>
            <FiZap size={16} /> {loading ? 'Creating your resume…' : 'Generate tailored resume'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AiResumeDetailsForm;
