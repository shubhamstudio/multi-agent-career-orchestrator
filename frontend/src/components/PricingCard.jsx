import { FiCheck } from 'react-icons/fi'
import { GiTwoCoins } from 'react-icons/gi'
import { motion } from 'motion/react'

function PricingCard({
    title,
    price,
    coins,
    button,
    features,
    popular,
    disabled,
    onBuy,
}) {
    return (
        <motion.div
        whileHover={disabled ? undefined : { y: -5, scale: 1.012 }}
        transition={{ type: "spring", stiffness: 360, damping: 24 }}
        className={`group relative w-full max-w-[320px] rounded-2xl overflow-hidden border p-5 bg-white transition-[border-color,box-shadow] duration-200 shadow-[0_12px_34px_rgba(71,85,105,0.08)]
        ${popular
          ? "border-[#8e98ff]/55 hover:border-[#7c87ff] hover:shadow-[0_20px_45px_rgba(96,107,235,0.18)]"
          : "border-[#e6edf9]"
        }`}>
            <div className='absolute inset-0 bg-gradient-to-br from-[#c1d3f8]/35 via-transparent to-transparent pointer-events-none'/>

            {popular && (<div className='absolute -top-8 -right-8 w-28 h-28 bg-violet-500/20 rounded-full blur-3xl pointer-events-none'/>)}

            {popular && (
                <div className='absolute right-3 top-3 rounded-full primary-gradient px-2 py-0.5 text-[10px] font-semibold text-white z-10'>Popular</div>
            )}
            
            <h2 className='relative text-base font-bold text-[#101828]'>{title}</h2>

            <div className='relative mt-2.5 flex items-end gap-1.5'>
                <span className='text-3xl font-extrabold text-[#101828]'>{price}</span>
                {price !== "Free" && (
                   <span className='pb-1 text-xs text-[#667085]'>
                    INR

                   </span>

                )}
            </div>

            <div className='relative mt-3.5 flex items-center gap-1.5 rounded-lg bg-[#f4f7fd] border border-[#dce7f8] p-2.5'>
            <GiTwoCoins className="text-yellow-400" size={14}/>
            <span className='text-sm font-semibold text-[#344054]'>
                {coins} GLAN Credits

            </span>
            </div>

            <div className='relative mt-3.5 space-y-1.5'>
                {features.map((f)=>(
                    <div key={f} className='flex items-center gap-2 text-xs text-[#667085]'>
                        <FiCheck className="text-green-400 shrink-0" size={13} />
                        <span>{f}</span>
                    </div>
                ))}
            </div>

            <motion.button disabled={disabled}
            onClick={onBuy}
            whileHover={disabled ? undefined : { scale: 1.025 }}
            whileTap={disabled ? undefined : { scale: 0.965, y: 1 }}
             className={`relative mt-5 w-full rounded-lg py-2 text-sm font-semibold transition-all duration-150
    ${
      disabled
        ? "cursor-not-allowed bg-gray-700 text-gray-400"
        : popular
        ? "cursor-pointer primary-gradient text-white shadow-[0_4px_14px_rgba(96,107,235,0.35)] hover:shadow-[0_7px_20px_rgba(96,107,235,0.48)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#606BEB] focus-visible:ring-offset-2"
        : "cursor-pointer bg-white border border-[#dce7f8] text-[#344054] hover:border-[#8e98ff]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#606BEB] focus-visible:ring-offset-2"
    }`}>
        {button}
    </motion.button>
        </motion.div>
    )
}

export default PricingCard
