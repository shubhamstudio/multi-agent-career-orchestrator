import { useRef } from 'react'
import { motion } from "motion/react"
import { FiArrowLeft, FiAward, FiCheck, FiTarget, FiTrendingUp, FiX } from 'react-icons/fi'
import DownloadBtn from '../resume/DownloadBtn'
function Step3report({ report, user, setUser, onBack }) {
  const reportRef = useRef(null)
  return (
    <div className='theme-page flex items-center justify-center p-3 sm:p-5'>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl overflow-hidden rounded-[24px] theme-surface">
        <div className='flex items-center justify-between border-b border-[#ebe6e1] px-5 py-5 sm:px-8 sm:py-6'>

          <div>
            <button type="button" onClick={onBack} className='inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#ebe6e1] bg-white px-3 py-1.5 text-[#625f5c] transition hover:border-[#e2ff70] hover:text-[#708900]'>
              <FiArrowLeft size={14} />
              <span className='text-xs'>Back</span>

            </button>

            <h1 className='text-2xl font-bold text-black mt-2'>Interview Report</h1>

            <p className='text-xs mb-2 text-zinc-500 mt-1.5'>
              AI Generated Performance Analysis
            </p>

            <DownloadBtn
              docRef={reportRef}
              user={user}
              setUser={setUser}
            />
          </div>

          <div className='hidden items-center gap-2.5 rounded-2xl border border-[#e5ff86] bg-[#f6ffd9] px-4 py-2.5 md:flex'>
            <FiAward className="text-[#819e00]" size={16} />

            <span className='text-sm font-medium text-[#8c4c34]'>Completed</span>
          </div>

        </div>


        <div className='p-4 sm:p-8' ref={reportRef}>
          <div className='grid md:grid-cols-3 gap-5'>
            <div className='rounded-2xl border border-[#ebe6e1] bg-white p-5 shadow-[0_8px_24px_rgba(44,33,27,.05)] sm:p-6'>

              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6ffd9] text-[#819e00]'>
                <FiTarget size={18} />
              </div>

              <p className='mt-5 text-zinc-500 text-xs'>Overall Score</p>

              <h2 className='mt-2 text-4xl font-bold text-[#171514]'>
                {report.overallScore}

                <span className='text-lg text-zinc-500'>/100</span>
              </h2>


            </div>

            <div className='rounded-2xl border border-[#ebe6e1] bg-white p-5 shadow-[0_8px_24px_rgba(44,33,27,.05)] sm:p-6'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6ffd9] text-[#819e00]'>
                <FiTrendingUp size={18} />
              </div>

              <p className='mt-5 text-zinc-500 text-xs'>Questions</p>

              <h2 className='mt-2 text-4xl font-bold text-[#171514]'>{report.questions.length}</h2>
            </div>


            <div className='rounded-2xl border border-[#ebe6e1] bg-white p-5 shadow-[0_8px_24px_rgba(44,33,27,.05)] sm:p-6'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6ffd9] text-[#819e00]'>
                <FiAward size={18} />
              </div>

              <p className='mt-5 text-zinc-500 text-xs'>Status</p>

              <h2 className='mt-2 text-2xl font-bold text-[#171514] sm:text-3xl'>Completed</h2>
            </div>


          </div>

          <div className='mt-6 rounded-2xl border border-[#ebe6e1] bg-white p-5 shadow-[0_8px_24px_rgba(44,33,27,.04)] sm:p-6'>
            <h3 className="text-lg font-semibold text-[#171514]">
              Interview Summary
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#625f5c]">
              {report.summary}
            </p>

          </div>

          <div className='grid lg:grid-cols-2 gap-5 mt-6'>

            <div className='rounded-2xl border border-green-200 bg-white p-5 shadow-[0_8px_24px_rgba(44,33,27,.04)] sm:p-6'>

              <div className='flex items-center gap-2.5'>
                <div className='w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center'>
                  <FiTrendingUp className='text-white' size={16} />
                </div>
                <h2 className="text-lg font-semibold text-[#171514]">
                  Strengths
                </h2>
              </div>

              <div className='mt-5 space-y-3'>
                {report.strengths?.length >0 ? (
                  report.strengths?.map((s)=>(
                    <div key={s} className='flex items-start gap-3 rounded-xl border border-green-100 bg-green-50/70 p-3.5'>
                      <div className='w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-xs'><FiCheck size={16}/></div>

                      <p className='text-sm leading-6 text-[#4e5c51]'>{s}</p>
                      </div>
                  ))

                ):(
                  <p className="text-zinc-500 text-sm">
                      No strengths available.
                    </p>
                )}
              </div>



            </div>


           <div className='rounded-2xl border border-red-200 bg-white p-5 shadow-[0_8px_24px_rgba(44,33,27,.04)] sm:p-6'>

              <div className='flex items-center gap-2.5'>
                <div className='w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center'>
                  <FiX className='text-white' size={16} />
                </div>
                <h2 className="text-lg font-semibold text-[#171514]">
                  Areas to Improve
                </h2>
              </div>

              <div className='mt-5 space-y-3'>
                {report.weaknesses?.length >0 ? (
                  report.weaknesses?.map((s)=>(
                    <div key={s} className='flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/70 p-3.5'>
                      <div className='w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 text-xs'>!</div>

                      <p className='text-sm leading-6 text-[#654e4e]'>{s}</p>
                      </div>
                  ))

                ):(
                  <p className="text-zinc-500 text-sm">
                      No weaknesses found.
                    </p>
                )}
              </div>



            </div>
          </div>

          <div className='mt-6 rounded-2xl border border-[#ebe6e1] bg-white p-5 shadow-[0_8px_24px_rgba(44,33,27,.04)] sm:p-6'>
          <h3 className="text-lg font-semibold text-[#171514]">
                Recommendations
              </h3>


              <div className='mt-5 space-y-3'>
                {
                  report.recommendations?.length > 0 ? (
                    report.recommendations?.map((r, i)=>(
                      <div key={i} className='flex items-start gap-3.5 rounded-xl border border-[#eee7e1] bg-[#fbffed] p-4'>
                        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#d2ff00] text-sm font-semibold text-[#171514]'>{i+1}</div>
                        <p className='text-sm leading-6 text-[#625f5c]'>{r}</p>
                        </div>
                    ))

                  ):(
                    <p className="text-zinc-500 text-sm">
                    No recommendations available.</p>
                  )
                }
              </div>
          </div>


          <div className='mt-8'>
             <h3 className="text-xl font-bold text-black mb-5">
                Question Wise Analysis
              </h3>

              <div className='space-y-5'>
                {report.questions?.map((item,index)=>(
                  <div key={index} className='rounded-2xl border border-[#ebe6e1] bg-white p-5 shadow-[0_8px_24px_rgba(44,33,27,.04)] sm:p-6'>
                    <div>
                      <span className='text-[11px] uppercase tracking-widest text-[#819e00]'>
                        Question {index+1}

                      </span>
                      <h4 className='mt-2.5 text-base font-semibold leading-7 text-[#171514]'>{item.question}</h4>
                    </div>

                    <div className='mt-6'>
                      <p className='text-[11px] uppercase tracking-widest text-[#8b8581]'> Your Answer</p>
                      <p className='mt-2.5 text-sm leading-6 text-[#625f5c]'>
                        {item.userAnswer || "No answer submitted"}
                      </p>
                    </div>

                    <div className='grid md:grid-cols-4 gap-3.5 mt-6'>
                      <div className='rounded-xl border border-[#eee7e1] bg-[#fbffed] p-3.5'>
                      <p className='text-xs text-zinc-500'>Score</p>
                      <h5 className='mt-2 text-xl font-bold text-[#171514]'>
                        {item.feedback?.score ?? 0}
                      </h5>
                      
                      </div>

                      <div className='rounded-xl border border-[#eee7e1] bg-[#fbffed] p-3.5'>
                      <p className='text-xs text-zinc-500'>Clarity</p>
                      <h5 className='mt-2 text-xl font-bold text-[#171514]'>
                        {item.feedback?.clarity ?? 0}
                      </h5>
                      
                      </div>

                      <div className='rounded-xl border border-[#eee7e1] bg-[#fbffed] p-3.5'>
                      <p className='text-xs text-zinc-500'>Relevance</p>
                      <h5 className='mt-2 text-xl font-bold text-[#171514]'>
                        {item.feedback?.relevance ?? 0}
                      </h5>
                      
                      </div>

                      <div className='rounded-xl border border-[#eee7e1] bg-[#fbffed] p-3.5'>
                      <p className='text-xs text-zinc-500'>Communication</p>
                      <h5 className='mt-2 text-xl font-bold text-[#171514]'>
                        {item.feedback?.communication ?? 0}
                      </h5>
                      
                      </div>
                    </div>

                    <div className='mt-6 rounded-xl border border-[#e5ff86] bg-[#f8ffe5] p-4.5'>
                    <p className='text-[11px] uppercase tracking-widest text-[#819e00]'>AI Feedback</p>
                    <p className='mt-2.5 text-sm leading-6 text-[#625f5c]'>{item.feedback?.feedback ||
                          "No feedback available."}</p>
                    </div>


                    {item.feedback?.improvements?.length > 0 && (
                      <div className='mt-6'>
                         <h5 className="text-sm font-semibold text-[#171514]">
                          Suggested Improvements
                        </h5>
                        <div className='mt-3.5 space-y-2.5'>
                          {item.feedback?.improvements?.map((item, i)=>(
                            <div key={i} className='rounded-lg border border-[#eee7e1] bg-[#fbffed] p-3.5'>
                              <p className='text-sm text-[#625f5c]'>
                               • {item}
                              </p>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}

                  </div>
                ))}
              </div>
          </div>

        </div>

      </motion.div>
    </div>
  )
}

export default Step3report
