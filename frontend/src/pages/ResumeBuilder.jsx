import { useState } from 'react'
import ResumeForm from '../components/resume/ResumeForm'
import initialData from '../components/resume/initialData'
import { motion } from "motion/react"
import { FiArrowLeft, FiArrowRight, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PreviewResume from '../components/resume/PreviewResume';
import Brand from '../components/Brand';
import TemplateSelection from '../components/resume/TemplateSelection';
import AiResumeDetailsForm from '../components/resume/AiResumeDetailsForm';
import api from '../utils/axios';
const STEPS = [
  { step: 1, title: "Personal Information", subtitle: "Your basic contact details" },
  { step: 2, title: "Professional Summary", subtitle: "A quick intro about yourself" },
  { step: 3, title: "Skills", subtitle: "Your technical skills" },
  { step: 4, title: "Work Experience", subtitle: "Your past jobs & internships" },
  { step: 5, title: "Projects", subtitle: "Projects you have built" },
  { step: 6, title: "Education", subtitle: "Your academic background" },
];

const TOTAL_STEPS = STEPS.length;

function ResumeBuilder({user , setUser}) {
    const [currentStep,setCurrentStep] = useState(1)
    const [data,setData]= useState(initialData)
    const [showPreview,setShowPreview] = useState(false)
    const [templateId, setTemplateId] = useState(null)
    const navigate = useNavigate()
    const progressPct = ((currentStep)/(TOTAL_STEPS))* 100
    const activeStep = STEPS.find((s)=>s.step === currentStep);
    const goPrev = ()=>{
      if(currentStep > 1){
        setCurrentStep(currentStep -1)
      }
    }

     const goNext = ()=>{
      if(currentStep < TOTAL_STEPS){
        setCurrentStep(currentStep + 1)
      }
    }


    const isLastStep = currentStep === STEPS.length

    if (!templateId) {
      return <TemplateSelection onSelect={setTemplateId} onBack={() => navigate('/dashboard')} />
    }

    const generateAiResume = async (brief) => {
      const response = await api.post('/api/resume/generate', brief)
      setData((current) => ({ ...current, ...response.data.data }))
      setShowPreview(true)
    }

    if (templateId === 'ai-generated' && !showPreview) {
      return <AiResumeDetailsForm onBack={() => setTemplateId(null)} onGenerated={generateAiResume} />
    }

    if(showPreview){
      return <PreviewResume data={data} setData={setData} templateId={templateId} user={user} setUser={setUser} onBack={()=>setShowPreview(false)} onChangeTemplate={() => { setShowPreview(false); setTemplateId(null) }} />
    }
  return (
    <div className='theme-page flex flex-col'>
      <motion.nav 
        initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
        className='sticky top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl'>
            <div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-5'>
                <div className='flex items-center gap-3'>
                  <button onClick={()=>navigate("/dashboard")}
                    aria-label="Back to dashboard"
                    className='flex h-8 items-center gap-1.5 rounded-lg border border-[#ebe6e1] bg-white px-2.5 text-[#625f5c] transition hover:border-[#e2ff70] hover:text-[#708900]'>
                    <FiArrowLeft size={15}/>
                    <span className='hidden text-xs font-medium sm:inline'>Back</span>
                  </button>
                  <div className='flex items-center gap-1.5'>
                    <Brand className='text-sm font-extrabold sm:text-base text-[#0A0A0A]' markClassName='h-5 w-5' />
                    <span className='hidden rounded bg-[#f6ffd9] px-1.5 py-0.5 text-[10px] text-[#667b00] sm:block'>Resume Builder</span>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <button onClick={() => setTemplateId(null)} className='hidden rounded-lg border border-black/15 px-2.5 py-1.5 text-[10px] text-black/60 transition hover:border-black/35 hover:text-[#0A0A0A] sm:block'>Change template</button>
                  <button onClick={()=>setShowPreview(true)} aria-label='Preview resume' className='flex h-8 items-center justify-center rounded-lg border border-black/15 px-2 text-black/60 transition hover:border-[#0A0A0A] hover:text-[#0A0A0A]'>
                    <FiEye size={13}/>
                  </button>
                </div>

            </div>

        </motion.nav>


        {/* main container */}

        <div className='flex-1 px-3 py-4 sm:px-6 sm:py-8 lg:px-10'>
          <div className='mx-auto w-full max-w-4xl xl:max-w-5xl'>
            <div className='mb-4'>
              <div className='flex items-center justify-between mb-1.5'>
                <p className='text-[10px] text-black/40 font-medium'>
                STEP {currentStep} OF {TOTAL_STEPS} 
                </p>

                <p className='hidden text-[10px] text-black/40 sm:block'>
                {Math.round(progressPct)}% complete
                </p>
              </div>

              <div className='w-full h-1 bg-black/8 rounded-full overflow-hidden'>
              <div className='h-full bg-[#0A0A0A] rounded-full transition-all duration-300' style={{width: `${progressPct}%`}} />
              </div>

              <div className='mt-3'>
                <h2 className='text-xl font-bold sm:text-2xl lg:text-3xl'>{activeStep.title}</h2>
                <p className='mt-1 text-xs text-black/45 sm:text-sm'>{activeStep.subtitle}</p>
              </div>
            </div>

            <div className='border-t border-black/8 mb-4'/>
             <ResumeForm step={currentStep} data={data} setData={setData}/>

             <div className='border-t border-black/8 mt-6 mb-4'/>


             {/* Navigation buttons */}

             <div className='flex items-center justify-between'>
              <button
              onClick={goPrev}
              disabled={currentStep === 1}
               className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all
                ${currentStep === 1
                  ? "border-black/8 text-black/25 cursor-not-allowed"
                  : "border-black/20 text-black/60 hover:border-black/40 hover:text-[#0A0A0A]"
                }`}>
                  <FiArrowLeft size={15}/>
                  <span className='hidden sm:block'>Previous</span>

              </button>

              <div className='flex items-center gap-1.5'>
                {STEPS.map((s)=>(
                  <button key={s.step}
                  onClick={()=>setCurrentStep(s.step)}
                   className={`rounded-full transition-all ${s.step === currentStep
                    ? "w-4 h-1.5 bg-[#0A0A0A]"
                    : s.step < currentStep
                      ? "w-1.5 h-1.5 bg-black/35"
                      : "w-1.5 h-1.5 bg-black/12"
                    }`}/>
                ))}
              </div>

              {isLastStep ? (
                <button onClick={()=>setShowPreview(true)} className='flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#000000]/90 backdrop-blur-2xl border border-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:border-white/20 transition-all'>
                  <FiEye size={13}/>
                  <span className='hidden sm:block'>Preview Resume</span>
                </button>
              ):(
              <button onClick={goNext} className='flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#000000]/90 backdrop-blur-2xl border border-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:border-white/20 transition-all'>
                  <span className='hidden sm:block'>Next</span><FiArrowRight size={15}/></button>
              )}
             </div>
          </div>
        </div>

     

    </div>
  )
}

export default ResumeBuilder
