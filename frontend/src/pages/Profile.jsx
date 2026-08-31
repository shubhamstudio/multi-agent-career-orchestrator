import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { FiCheck, FiEdit3, FiLogOut, FiMenu, FiTarget, FiUser } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { updateProfile } from "../apis/user.api"
import api from "../utils/axios"

const experienceOptions = ["", "Student", "Entry level", "Mid level", "Senior", "Lead / Manager"]

export default function Profile({ user, setUser }) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [form, setForm] = useState({
        name: user?.name || "", headline: user?.headline || "", currentRole: user?.currentRole || "",
        targetRole: user?.targetRole || "", experienceLevel: user?.experienceLevel || "",
        location: user?.location || "", bio: user?.bio || "", careerGoal: user?.careerGoal || "",
        skills: (user?.skills || []).join(", "),
    })
    const navigate = useNavigate()
    const initials = useMemo(() => (user?.name || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), [user])
    const completedFields = [form.name, form.headline, form.currentRole, form.targetRole, form.experienceLevel, form.location, form.bio, form.careerGoal, form.skills].filter(Boolean).length
    const completion = Math.round((completedFields / 9) * 100)

    const onChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    const handleSave = async (event) => {
        event.preventDefault()
        setSaving(true); setMessage("")
        try {
            const result = await updateProfile({ ...form, skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean) })
            setUser(result.user)
            setEditing(false)
            setMessage("Your profile has been updated.")
        } catch (error) {
            setMessage(error.response?.data?.message || "We couldn't update your profile. Please try again.")
        } finally { setSaving(false) }
    }
    const logout = async () => { await api.get("/api/auth/logout"); setUser(null); navigate("/") }

    return <div className="theme-page min-h-screen font-sans">
        <div className="dashboard-aurora" />
        <Sidebar user={user} onNewInterview={() => navigate("/interview")} onLogout={logout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main className={`dashboard-main relative z-10 transition-[margin-left] duration-250 ${sidebarOpen ? "md:ml-[260px]" : "md:ml-[72px]"}`}>
            <div className="dashboard-topbar">
                <button onClick={() => setMobileOpen(true)} className="dashboard-menu-btn md:hidden"><FiMenu size={20} /></button>
                <p className="text-xs font-semibold text-black/45">Account & preferences</p>
            </div>
            <div className="mx-auto max-w-5xl pb-12">
                <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-[#e8e2dc] bg-white shadow-[0_18px_55px_rgba(44,33,27,.07)]">
                    <div className="h-32 bg-[radial-gradient(circle_at_80%_20%,rgba(210,255,0,.8),transparent_32%),linear-gradient(120deg,#20251c,#586638)]" />
                    <div className="relative px-5 pb-6 sm:px-8">
                        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-[#d2ff00] text-2xl font-black text-[#273000] shadow-lg">{initials}</div>
                                <div className="min-w-0 pt-16"><h1 className="text-2xl font-bold leading-tight text-[#171514]">{user?.name}</h1><p className="mt-1 text-sm text-[#77716d]">{user?.headline || user?.targetRole || "Add a headline to tell us where you're headed"}</p></div>
                            </div>
                            <button onClick={() => setEditing((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ded7d1] bg-white px-4 py-2.5 text-sm font-semibold hover:border-[#c5e64d] hover:bg-[#fbffed] sm:mt-16"><FiEdit3 />{editing ? "Cancel editing" : "Edit profile"}</button>
                        </div>
                        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#f7f5f2] p-4">
                            <div className="flex-1"><div className="flex justify-between text-xs font-semibold"><span>Profile completion</span><span>{completion}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#a7cc00] transition-all" style={{ width: `${completion}%` }} /></div></div>
                            {completion === 100 && <FiCheck className="text-[#718b00]" />}
                        </div>
                    </div>
                </motion.section>

                {message && <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${message.includes("updated") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message}</p>}

                <form onSubmit={handleSave} className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
                    <section className="glass-surface p-5 sm:p-7">
                        <div className="mb-6 flex items-center gap-3"><span className="agent-icon-badge"><FiUser /></span><div><h2 className="font-bold">Career profile</h2><p className="text-xs text-black/45">Used by Glangen's agents to personalize your guidance.</p></div></div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <ProfileField label="Full name" name="name" value={form.name} onChange={onChange} disabled={!editing} />
                            <ProfileField label="Professional headline" name="headline" value={form.headline} onChange={onChange} disabled={!editing} placeholder="Frontend developer building accessible products" />
                            <ProfileField label="Current role" name="currentRole" value={form.currentRole} onChange={onChange} disabled={!editing} />
                            <ProfileField label="Target role" name="targetRole" value={form.targetRole} onChange={onChange} disabled={!editing} />
                            <label className="text-xs font-semibold text-[#4e4945]">Experience level<select name="experienceLevel" value={form.experienceLevel} onChange={onChange} disabled={!editing} className="profile-input">{experienceOptions.map((option) => <option key={option} value={option}>{option || "Select level"}</option>)}</select></label>
                            <ProfileField label="Location" name="location" value={form.location} onChange={onChange} disabled={!editing} />
                            <div className="sm:col-span-2"><ProfileField label="Skills" name="skills" value={form.skills} onChange={onChange} disabled={!editing} placeholder="React, Node.js, System Design" /></div>
                            <div className="sm:col-span-2"><ProfileField label="About you" name="bio" value={form.bio} onChange={onChange} disabled={!editing} textarea /></div>
                        </div>
                        {editing && <button disabled={saving} className="mt-5 rounded-xl bg-[#171514] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#384118] disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>}
                    </section>
                    <aside className="space-y-5">
                        <section className="glass-surface p-5"><div className="mb-4 flex items-center gap-2"><FiTarget className="text-[#819e00]" /><h2 className="font-bold">Career goal</h2></div><textarea name="careerGoal" value={form.careerGoal} onChange={onChange} disabled={!editing} rows="7" className="profile-input resize-none" placeholder="Describe what you want to achieve next…" /></section>
                        <section className="glass-surface p-5"><p className="text-xs font-semibold uppercase tracking-widest text-black/40">Account</p><p className="mt-3 text-sm font-semibold">{user?.email}</p><p className="mt-1 text-xs text-black/45">Your sign-in email is managed by your authentication provider.</p><button type="button" onClick={logout} className="mt-5 flex items-center gap-2 text-sm font-semibold text-red-600"><FiLogOut /> Sign out</button></section>
                    </aside>
                </form>
            </div>
        </main>
    </div>
}

function ProfileField({ label, textarea, ...props }) {
    return <label className="text-xs font-semibold text-[#4e4945]">{label}{textarea ? <textarea {...props} rows="4" className="profile-input resize-none" /> : <input {...props} className="profile-input" />}</label>
}
