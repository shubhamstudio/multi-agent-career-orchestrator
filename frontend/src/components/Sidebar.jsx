import { AnimatePresence, motion } from "motion/react"
import { GiTwoCoins } from 'react-icons/gi'
import { FiBarChart2, FiFileText, FiGrid, FiLogOut, FiMap, FiPlus, FiSidebar, FiStar, FiUser } from 'react-icons/fi'
import { useLocation, useNavigate } from "react-router-dom"
import { FaCirclePlus } from "react-icons/fa6";
import Brand from './Brand'

const NAV_ITEMS = [
    {
        icon: <FiGrid size={15} />,
        label: "Dashboard",
        path: "/dashboard",
    },
    {
        icon: <FiFileText size={15} />,
        label: "Resume Builder",
        path: "/resume",
    },
    {
        icon: <FiStar size={15} />,
        label: "Resume Scorer",
        path: "/scorer",
    },
    {
        icon: <FiMap size={15} />,
        label: "Roadmap Builder",
        path: "/roadmap",
    },
    {
        icon: <FiBarChart2 size={15} />,
        label: "Interview Feedback",
        path: "/feedback",
    },


];

function Sidebar({
    user,
    onNewInterview,
    onLogout,
    sidebarOpen,
    setSidebarOpen,
    mobileOpen,
    setMobileOpen
}) {
    const navigate = useNavigate()
    const location = useLocation()
    const avatar = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"


    const inner = (
        <div className='flex flex-col h-full'>
            <div className={`px-3 h-[52px] border-b border-black/[0.05] shrink-0 flex items-center ${sidebarOpen ? "justify-between" : "justify-center"
                }`}>
                {sidebarOpen && (
                    <motion.div
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                    >
                        <Brand
                            className='font-extrabold text-sm tracking-tight text-[#0A0A0A] whitespace-nowrap'
                            markClassName='h-5 w-5'
                        />
                    </motion.div>
                )}
                <div className='flex items-center '>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className='cursor-pointer hidden md:flex text-dark-200 hover:text-[#819e00] transition-colors shrink-0'>
                        <FiSidebar size={15} />

                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className='cursor-pointer md:hidden text-dark-200 hover:text-[#819e00] transition-colors shrink-0'>
                        <FiSidebar size={15} />

                    </motion.button>
                </div>

            </div>


            <div className='px-2.5 pt-3 pb-1.5 shrink-0'>
                <motion.button
                    onClick={onNewInterview}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center gap-2 primary-gradient text-white font-semibold rounded-lg py-2 transition-all shadow-[0_4px_14px_rgba(210,255,0,0.25)] cursor-pointer hover:brightness-105 ${sidebarOpen ? "px-2.5 " : "justify-center px-0"
                        }`}>
                    <FiPlus size={14} className='shrink-0' />
                    <AnimatePresence>
                        {sidebarOpen &&
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.13 }}
                                className='text-xs whitespace-nowrap'>
                                Create Interview
                            </motion.span>}
                    </AnimatePresence>
                </motion.button>
            </div>
            <AnimatePresence>
                {sidebarOpen &&
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.13 }}
                        className='px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-dark-200/70'>
                        Agents

                    </motion.p>}
            </AnimatePresence>

            <nav className='flex flex-col gap-0.5 px-2.5 flex-1'>
                {NAV_ITEMS.map((nav, i) => (
                    <motion.button key={i}
                        onClick={() => {
                            navigate(nav.path);
                            setMobileOpen(false)
                        }}
                        whileHover={{ x: sidebarOpen ? 3 : 0 }}
                        transition={{ duration: 0.13 }}
                        className={`flex items-center gap-2.5 rounded-lg py-2 transition-all text-xs font-medium hover:text-[#171514] hover:bg-[#f6ffd9] cursor-pointer ${location.pathname === nav.path ? "bg-[#f6ffd9] text-[#536800]" : "text-dark-200"} ${sidebarOpen ? "px-2.5 " : "justify-center px-0"
                            }`}>
                        <span className='shrink-0'>{nav.icon}</span>

                        {sidebarOpen &&
                            <span className='whitespace-nowrap'>{nav.label}
                            </span>}



                    </motion.button>
                ))}

            </nav>

            {/* coins */}

            <div className='border-t border-black/[0.05] p-2.5 shrink-0'>
                <motion.button
                    onClick={() => { navigate("/profile"); setMobileOpen(false) }}
                    whileHover={{ x: sidebarOpen ? 3 : 0 }}
                    className={`mb-2 flex w-full items-center gap-2.5 rounded-lg py-2 text-xs font-medium transition-all hover:bg-[#f6ffd9] ${location.pathname === "/profile" ? "bg-[#f6ffd9] text-[#536800]" : "text-dark-200"} ${sidebarOpen ? "px-2.5" : "justify-center px-0"}`}
                >
                    <FiUser size={15} />
                    {sidebarOpen && <span>My Profile</span>}
                </motion.button>
                <AnimatePresence>
                    {sidebarOpen &&
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.13 }}
                            onClick={() => navigate("/billing")}
                            className='group flex cursor-pointer items-center justify-between gap-2.5 rounded-lg border border-[#e5ff86] bg-[#f6ffd9] px-2.5 py-2 mb-2.5 transition-all hover:bg-[#f6ffd9] shadow-[0_6px_18px_rgba(210,255,0,0.08)]'>
                            <div className='flex items-center gap-1.5'>
                                <GiTwoCoins size={15} className='text-[#819e00] shrink-0' />

                                <div className='flex flex-col'>
                                    <span className='text-[9px] uppercase tracking-wider text-[#8c5b48] font-medium'>Interview Coins</span>
                                    <span className='text-xs font-bold text-[#3a2a24]'>{user?.interviewCoin}</span>
                                </div>
                            </div>

                            <div className='flex items-center justify-center'>
                                <FaCirclePlus size={16} className='text-[#819e00] transition-transform duration-200 group-hover:scale-110' />
                            </div>


                        </motion.div>}
                </AnimatePresence>

                <div className={`flex items-center gap-2 ${sidebarOpen ? "" : "justify-center"}`}>
                    <div className='w-7 h-7 rounded-full primary-gradient flex items-center justify-center shrink-0'>
                        <span className='text-white font-bold text-[10px]'>
                            {avatar}

                        </span>
                    </div>

                    <AnimatePresence>
                        {sidebarOpen && (

                            <motion.div initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 min-w-0">
                                <p className="text-[#0A0A0A] text-[11px] font-semibold truncate">
                                    {user?.name ?? "User"}
                                </p>
                                <p className="text-dark-200/70 text-[9px] truncate">
                                    {user?.email ?? "user@email.com"}
                                </p>
                            </motion.div>

                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {sidebarOpen && (

                            <motion.button
                                onClick={onLogout}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                whileHover={{ scale: 1.15 }}
                                className='text-dark-200 hover:text-red-500 transition-colors ml-auto'>
                                <FiLogOut size={13} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

        </div>
    )
    return (
        <>
            <motion.aside
                animate={{ width: sidebarOpen ? 260 : 72 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}

                className='hidden md:flex fixed top-0 left-0 h-screen bg-white/95 backdrop-blur-xl border-r border-[#ebe6e1] flex-col z-40 overflow-hidden shadow-[8px_0_28px_rgba(44,33,27,.035)]'>
                {inner}
            </motion.aside>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className='fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm' />
                )}
            </AnimatePresence>


            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className='fixed top-0 left-0 h-screen w-[280px] max-w-[85vw] bg-white/95 backdrop-blur-xl border-r border-[#ebe6e1] flex flex-col z-50 md:hidden overflow-hidden'>
                        {inner}
                    </motion.aside>
                )}
            </AnimatePresence>


        </>
    )
}

export default Sidebar
