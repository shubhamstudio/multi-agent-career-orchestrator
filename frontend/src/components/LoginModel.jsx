import React from 'react'
import { motion, AnimatePresence } from "motion/react"
import { FaArrowRight, FaShieldAlt, FaTimes } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "../utils/firebase.js"
import api from "../utils/axios.js"
import { BrandMark } from "./Brand.jsx"

const withTimeout = (promise, timeoutMs, errorCode) =>
  new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      const error = new Error("Google sign-in took too long. Please try again.")
      error.code = errorCode
      reject(error)
    }, timeoutMs)

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timeoutId)
        reject(error)
      }
    )
  })

function LoginModel({ onClose, setUser }) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const closeButtonRef = React.useRef(null)

  React.useEffect(() => {
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [loading, onClose])

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await withTimeout(
        signInWithPopup(auth, provider),
        30_000,
        "auth/popup-timeout"
      )
      const token = await result.user.getIdToken(true)

      if (!token || token.split(".").length !== 3) {
        throw new Error("Firebase did not return a valid ID token.")
      }

      const response = await api.post(
        "/api/auth/login",
        { token },
        { timeout: 15_000 }
      )

      setUser(response?.data?.user)

      onClose()
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.message ||
        err.code ||
        "Couldn't sign you in. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className='login-overlay'
      >
        <div className='login-backdrop-orb login-backdrop-orb-left' />
        <div className='login-backdrop-orb login-backdrop-orb-right' />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className='login-card'
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
          aria-describedby="login-description"
        >
          <div className='login-card-grid' aria-hidden="true" />
          <div className='login-card-glow' aria-hidden="true" />

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className='login-close-btn'
            aria-label="Close sign-in dialog"
          >
            <FaTimes size={14} />
          </button>

          <motion.div
            className='relative z-10'
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }} className='login-brand-row'>
              <BrandMark className="h-9 w-9 rounded-xl" />
              <span className='login-brand-name'>GLANGEN</span>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className='login-intro'>
              <span className='login-eyebrow'><span className='login-status-dot' />Interview workspace</span>
              <h2 id="login-title" className='login-title'>Ready for your next round?</h2>
              <p id="login-description" className='login-subtitle'>Sign in to practice with your AI interview team and keep your progress in one place.</p>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="login-action-area">
              <motion.button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                whileHover={{ y: loading ? 0 : -2 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className='login-google-btn'
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className='login-spinner' />
                    <span>Opening Google…</span>
                  </>
                ) : (
                  <>
                    <FcGoogle size={18} />
                    <span>Continue with Google</span>
                    <FaArrowRight className="login-button-arrow" size={12} aria-hidden="true" />
                  </>
                )}
              </motion.button>
              <p className='login-assurance'>A secure Google window will open to complete sign-in.</p>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className='login-error'
                    role="alert"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }} className='login-footer'>
              <FaShieldAlt aria-hidden="true" />
              <p className='login-footer-text'>Your session and interview history stay protected.</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LoginModel
