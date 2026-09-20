/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiTrash2, FiX } from 'react-icons/fi'

const FeedbackContext = createContext(null)

const notificationStyles = {
  success: { icon: FiCheckCircle, iconClass: 'bg-[#f1ffd0] text-[#718b00]', title: 'Done' },
  error: { icon: FiAlertCircle, iconClass: 'bg-red-50 text-red-600', title: 'Something went wrong' },
  info: { icon: FiInfo, iconClass: 'bg-[#f6ffd9] text-[#718b00]', title: 'Heads up' },
}

export function FeedbackProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [confirmation, setConfirmation] = useState(null)
  const notificationId = useRef(0)
  const confirmationResolver = useRef(null)
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    window.clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }, [])

  const notify = useCallback((message, { type = 'info', title, duration = 5000 } = {}) => {
    const id = ++notificationId.current
    setNotifications((current) => [...current, { id, message, type, title }].slice(-4))
    timers.current.set(id, window.setTimeout(() => dismiss(id), duration))
    return id
  }, [dismiss])

  const confirmAction = useCallback((options) => new Promise((resolve) => {
    confirmationResolver.current = resolve
    setConfirmation({
      title: 'Are you sure?',
      description: '',
      confirmLabel: 'Continue',
      cancelLabel: 'Cancel',
      tone: 'default',
      ...options,
    })
  }), [])

  const closeConfirmation = useCallback((approved) => {
    confirmationResolver.current?.(approved)
    confirmationResolver.current = null
    setConfirmation(null)
  }, [])

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
  }, [])

  return (
    <FeedbackContext.Provider value={{ notify, confirmAction }}>
      {children}
      <section className='pointer-events-none fixed inset-x-0 top-4 z-[200] mx-auto flex w-full max-w-md flex-col gap-2 px-4' aria-live='polite' aria-atomic='true'>
        <AnimatePresence initial={false}>
          {notifications.map((notification) => {
            const style = notificationStyles[notification.type] || notificationStyles.info
            const Icon = style.icon
            return (
              <motion.div key={notification.id} initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.18 }} className='pointer-events-auto flex items-start gap-3 rounded-2xl border border-[#e7e1db] bg-white/95 p-3.5 shadow-[0_18px_45px_rgba(44,33,27,.16)] backdrop-blur-xl'>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${style.iconClass}`}><Icon size={18} /></span>
                <div className='min-w-0 flex-1 pt-0.5'>
                  <p className='text-sm font-semibold text-[#171514]'>{notification.title || style.title}</p>
                  <p className='mt-0.5 text-xs leading-5 text-[#625f5c]'>{notification.message}</p>
                </div>
                <button onClick={() => dismiss(notification.id)} aria-label='Dismiss notification' className='rounded-lg p-1 text-black/35 transition hover:bg-black/5 hover:text-black'><FiX size={17} /></button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {confirmation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-[210] grid place-items-center bg-black/40 p-4 backdrop-blur-sm' role='dialog' aria-modal='true' aria-labelledby='action-confirmation-title'>
            <motion.div initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} className='w-full max-w-sm rounded-2xl border border-[#e6e1db] bg-white p-5 shadow-[0_24px_70px_rgba(23,21,20,.25)]'>
              <div className='flex items-start justify-between gap-4'>
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${confirmation.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-[#f6ffd9] text-[#718b00]'}`}>
                  {confirmation.tone === 'danger' ? <FiTrash2 size={18} /> : <FiAlertCircle size={18} />}
                </span>
                <button onClick={() => closeConfirmation(false)} aria-label='Cancel' className='rounded-lg p-1 text-black/40 transition hover:bg-black/5 hover:text-black'><FiX size={18} /></button>
              </div>
              <h2 id='action-confirmation-title' className='mt-4 text-lg font-bold text-[#171514]'>{confirmation.title}</h2>
              <p className='mt-2 text-sm leading-6 text-black/55'>{confirmation.description}</p>
              <div className='mt-5 flex gap-2.5'>
                <button onClick={() => closeConfirmation(false)} className='flex-1 rounded-xl border border-[#ded7d1] px-3 py-2.5 text-sm font-semibold text-[#625f5c] transition hover:border-[#bdb5ae]'>{confirmation.cancelLabel}</button>
                <button onClick={() => closeConfirmation(true)} className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition ${confirmation.tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#171514] hover:bg-black'}`}>{confirmation.confirmLabel}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) throw new Error('useFeedback must be used within FeedbackProvider.')
  return context
}
