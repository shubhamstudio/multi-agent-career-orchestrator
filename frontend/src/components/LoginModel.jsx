import React from 'react'
import { motion, AnimatePresence } from "motion/react"
import { FaTimes } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "../utils/firebase.js"
import api from "../utils/axios.js"
import { BrandMark } from "./Brand.jsx"

function LoginModel({ onClose, setUser }) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await signInWithPopup(auth, provider)
      const token = await result.user.getIdToken(true)

      if (!token || token.split(".").length !== 3) {
        throw new Error("Firebase did not return a valid ID token.")
      }

      const response = await api.post("/api/auth/login", { token })

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
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className='login-card'
        >
          {/* Ambient glow */}
          <div className='absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[#606BEB]/30 blur-[80px] pointer-events-none' />

          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className='login-close-btn'
          >
            <FaTimes size={14} />
          </motion.button>

          <div className='relative z-10 flex flex-col items-center'>
            <BrandMark className="h-12 w-12" />

            <h2 className='login-title'>Welcome to GLANGEN</h2>
            <p className='login-subtitle'>Continue your AI interview journey</p>

            <div className="mt-8 w-full">
              <motion.button
                onClick={handleGoogleAuth}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className='login-google-btn'
              >
                {loading ? (
                  <span className='login-spinner' />
                ) : (
                  <>
                    <FcGoogle size={18} />
                    <span>Continue with Google</span>
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className='login-error'
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className='login-footer'>
              <p className='login-footer-text'>Secured authentication powered by Firebase</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LoginModel
