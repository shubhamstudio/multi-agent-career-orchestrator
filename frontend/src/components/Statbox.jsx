import { motion } from "motion/react"
function Statbox({ label, value, sub, subHighlight, index = 0 }) {
  return (
    <motion.div 
    initial={{ opacity: 0, y: 20 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.4, delay: index * 0.08 }}

      whileHover={{ y: -4 }}
    className='relative overflow-hidden bg-white/95 border border-[#ebe6e1] rounded-2xl p-4 md:p-5 flex flex-col gap-1 shadow-[0_8px_26px_rgba(44,33,27,0.055)] hover:border-[#e2ff70] hover:shadow-[0_16px_34px_rgba(210,255,0,0.10)] transition-all'>

        <div className='absolute inset-0 bg-gradient-to-br from-[#f6ffd9] via-transparent to-transparent pointer-events-none'/>

        <p className='relative text-[#77716d] text-[9px] md:text-[11px] font-semibold uppercase tracking-wider'>{label}</p>

        <p className='relative text-[#171514] text-lg md:text-xl font-bold tracking-tight'>{value}</p>

        {sub && (
            <div className='relative flex items-center gap-1 mt-0.5 flex-wrap'>
                {subHighlight && (
                    <div className='text-[9px] font-semibold bg-[#f6ffd9] text-[#708900] px-1.5 py-0.5 rounded'>{subHighlight}</div>
                )}

                <span className='text-[#8b8581] text-[9px] md:text-[11px]'>{sub}</span>

            </div>
        )}


    </motion.div>
  )
}

export default Statbox
