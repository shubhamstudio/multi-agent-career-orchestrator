import { motion } from "motion/react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

function CustomTooltip({ active, payload }) {
    if (active && payload?.length) {
        return (
            <div className='bg-white border border-[#ebe6e1] rounded-xl px-3 py-2 text-[11px] text-[#171514] shadow-[0_12px_30px_rgba(44,33,27,.1)]'>
                <p className="text-[#77716d] mb-0.5">{payload[0]?.payload?.skill}</p>
                <p className="font-bold text-[#171514]">{payload[0]?.value}%</p>

            </div>
        )
    }
}
function RadarCard({ title, data, color, index }) {
    return (

        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -4 }}
            className='relative overflow-hidden rounded-2xl p-3 md:p-4 flex flex-col bg-white/95 border border-[#ebe6e1] shadow-[0_8px_26px_rgba(44,33,27,0.055)] hover:border-[#e2ff70] transition-all'>

            <div className='relative'>
                <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={data} cx="50%" cy="50%" outerRadius="68%">
                        <PolarGrid stroke="rgba(29,25,22,0.12)" gridType="polygon" />
                        <PolarAngleAxis dataKey="skill"
                            tick={{ fill: "#77716d", fontSize: 9, fontWeight: 600 }} />
                        <Radar
                            name={title}
                            dataKey="score"
                            stroke={color}
                            fill={color}
                            fillOpacity={0.15}
                            strokeWidth={2}
                            dot={{ r: 2.5, fill: color, strokeWidth: 0 }} />
                        <Tooltip content={<CustomTooltip/>}/>
                    </RadarChart>
                </ResponsiveContainer>
            <p className='text-[#38322f] font-semibold text-xs text-center mt-2'>
                    {title}
                </p>
            </div>

        </motion.div>

    )
}

function InterviewGraph({ technicalData, hrData, technicalCount, hrCount }) {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
            <RadarCard title={`Technical Interviews (${technicalCount})`}
                data={technicalData} color="#d2ff00" index={0}
            />
            <RadarCard title={`HR Interviews (${hrCount})`}
                data={hrData} color="#bce800" index={1}
            />

        </div>
    )
}

export default InterviewGraph
