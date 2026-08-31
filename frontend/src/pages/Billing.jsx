import { motion } from "motion/react"
import { useState } from 'react'
import { FiArrowLeft, FiMenu, FiX } from 'react-icons/fi'
import { GiTwoCoins } from 'react-icons/gi'
import PricingCard from '../components/PricingCard'
import api from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'

const plan = [
    {
        title: "Free",
        price: "Free",
        coins: 150,
        button: "Claimed Coins",
        popular: false,
        disabled: true,
        features: [
            "150 Interview Coins",
            "Resume Builder",
            "Resume Scorer",
            "Roadmap Generator",
        ],
    },
    {
        title: "Starter",
        price: "199",
        coins: 300,
        button: "Buy Now",
        popular: true,
        disabled: false,
        features: [
            "300 Interview Coins",
            "Unlimited Resume Score",
            "Unlimited Roadmaps",
            "Priority AI Response",
        ],
    },
];

const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) {
        resolve(true)
        return
    }

    const script = document.createElement("script")
    script.src = import.meta.env.VITE_RAZORPAY_CHECKOUT_URL
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
})

function Billing({ user, setUser }) {
    const [showMenu, setShowMenu] = useState(false)

    const navigate = useNavigate()
    const handlePayment = async (plan) => {
        if (plan.disabled) return;
        try {
            const checkoutLoaded = await loadRazorpay()
            if (!checkoutLoaded) {
                throw new Error("Unable to load Razorpay Checkout. Check your internet connection and try again.")
            }

            const result = await api.post("/api/billing/create",
                { planId: plan.title.toLowerCase() })

            if (!result.data?.keyId) {
                throw new Error("Billing service is missing the Razorpay checkout key. Restart the Billing service and try again.")
            }

            if (!window.Razorpay) {
                throw new Error("Razorpay Checkout did not initialize. Disable any ad blocker and try again.")
            }

            const options = {
                key: result.data.keyId,
                amount: result.data.order.amount,
                currency: result.data.order.currency,
                name: "GLANGEN",
                description: `${plan.title} - ${plan.coins} Interview Coins`,
                order_id: result.data.order.id,

                handler: async function (response) {
                    try {
                        const coinRes = await api.post("/api/billing/verify", response)

                        setUser((prev) => ({
                            ...prev, interviewCoin: coinRes.data.interviewCoin
                        }))

                        alert("Payment Successful 🎉")
                        navigate("/dashboard")

                    } catch (error) {
                        console.log(error);

                        alert(
                            error?.response?.data?.message ||
                            "Payment verification failed"
                        );
                    }

                },


                theme: {
                    color: "#000000",
                },

            }


            const razorpay = new window.Razorpay(options);
            razorpay.open()


        } catch (error) {
            console.log(error)
            alert(error.response?.data?.message || error.message || "Unable to start payment")
        }
    }
    return (
        <div className='theme-page'>
            <motion.nav
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className='sticky top-0 z-20 border-b border-[#ebe6e1] bg-white/90 backdrop-blur-xl'>
                <div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-5'>
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() => navigate("/dashboard")}
                            aria-label="Back to dashboard"
                            className='flex h-8 items-center gap-1.5 rounded-lg border border-[#ebe6e1] bg-white px-2.5 text-[#625f5c] transition hover:border-[#e2ff70] hover:text-[#708900]'>
                            <FiArrowLeft size={15} />
                            <span className='hidden text-xs font-medium sm:inline'>Back</span>
                        </button>
                        <div className='flex items-center gap-1.5'>
                            <Brand className='text-sm font-extrabold sm:text-base text-[#0A0A0A]' markClassName='h-5 w-5' />
                            <span className='hidden rounded bg-[#f6ffd9] px-1.5 py-0.5 text-[10px] text-[#667b00] sm:block'>Interview Coins</span>
                        </div>
                    </div>

                    <button onClick={() => setShowMenu(!showMenu)} className='flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 text-black/60 transition hover:border-black/35 hover:text-[#0A0A0A]'>
                        {showMenu ? <FiX size={16} /> : <FiMenu size={16} />}


                    </button>

                    {showMenu && (
                        <>
                            <div onClick={() => setShowMenu(false)} className='fixed inset-0 z-30 bg-black/20 lg:hidden' />

                            <div className='absolute right-1 top-11 z-40 w-[240px] max-w-[calc(100vw-24px)] rounded-xl overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]'>
                                <div className='absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none' />

                                <div className='relative flex items-center gap-2 border-b border-white/10 pb-3'>

                                    <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/15 border border-yellow-400/20'>
                                        <GiTwoCoins className='text-yellow-400 text-sm' />
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-white/40">
                                            Available Coins
                                        </p>
                                        <h3 className='text-lg font-bold text-white'>{user?.interviewCoin}</h3>
                                    </div>

                                </div>

                                <div className='relative mt-3.5 space-y-1.5'>
                                    {[
                                        { title: "Resume Builder", coin: "-10" },
                                        { title: "Resume Scorer", coin: "-10" },
                                        { title: "Roadmap Generator", coin: "-20" },
                                        { title: "AI Interview", coin: "-50" },
                                    ].map((item) => (
                                        <div key={item.title} className='flex items-center justify-between rounded-lg bg-white/5 border border-white/8 px-2.5 py-1.5'>
                                            <span className="text-xs text-white/70">
                                                {item.title}
                                            </span>
                                            <span className="text-xs font-bold text-red-400">
                                                {item.coin}
                                            </span>

                                        </div>
                                    ))}

                                </div>

                                <div className='relative mt-3.5 rounded-lg border border-violet-400/20 bg-violet-500/10 p-2.5'>
                                    <p className="text-[10px] leading-4 text-violet-300">
                                        Every AI feature uses Interview Coins.
                                        Buy more coins anytime to continue using
                                        Resume Builder, Resume Scorer,
                                        AI Interview and Roadmap Generator.
                                    </p>

                                </div>
                            </div>

                        </>
                    )}

                </div>

            </motion.nav>

            <div className='mx-auto max-w-4xl px-4 py-6'>

                <div className='text-center'>
                    <h1 className="text-3xl font-bold text-[#0A0A0A]">
                        Interview Coins
                    </h1>
                    <p className="mt-2 text-sm text-black/45">
                        Use coins for Resume Scoring, Resume Builder, AI Interviews, and Roadmap Generation.
                    </p>
                </div>

                <div className='mt-8 grid place-items-center gap-3 md:grid-cols-2'>
                    {plan.map((plan) => (
                        <PricingCard key={plan.title}
                            {...plan}
                            onBuy={() => handlePayment(plan)} />
                    ))
                    }

                </div>
            </div>

        </div>
    )
}

export default Billing
