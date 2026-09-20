import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes , Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import { getCurrentUser } from './apis/user.api'
import { getResume } from './apis/resume.api'
import { useDispatch } from 'react-redux'
import { setResume } from './redux/resumeSlice'
import { CreditConfirmationProvider } from './contexts/CreditConfirmationContext'

// Keep the public landing page small. Monaco, video interview tooling, charts, and
// PDF generation only need to download after an authenticated user opens them.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Scorer = lazy(() => import('./pages/Scorer'))
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'))
const InterviewStart = lazy(() => import('./pages/InterviewStart'))
const InterviewPage = lazy(() => import('./pages/InterviewPage'))
const InterviewReport = lazy(() => import('./pages/InterviewReport'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Billing = lazy(() => import('./pages/Billing'))
const Feedback = lazy(() => import('./pages/Feedback'))
const Profile = lazy(() => import('./pages/Profile'))
const About = lazy(() => import('./pages/About'))
const Faq = lazy(() => import('./pages/Faq'))
const Legal = lazy(() => import('./pages/Legal'))

function App() {
  const [user,setUser]= useState(null)
  const [loading , setLoading] = useState(true)
  const dispatch = useDispatch()


  useEffect(()=>{

    const getUser = async () => {
      try {
        const data = await getCurrentUser()
        setUser(data?.user ?? null)
      } catch (error) {
        // A temporarily unavailable backend must not leave the public app blank.
        console.warn("Unable to restore the current session:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

  },[])

  useEffect(()=>{

    if (!user) {
      return
    }

    const getResumeData = async()=>{
      try {
        const result = await getResume()
        dispatch(setResume(result?.data))
      } catch (error) {
        // Resume data is optional before a user signs in.
        console.warn("Unable to load the current resume:", error)
      }
    }

    getResumeData()

  },[dispatch, user])


  if(loading){
    return(
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <div className="h-1 bg-black animate-pulse w-full" />
      </div>
    )
  }

  return (
   <CreditConfirmationProvider>
   <Suspense fallback={<div className="fixed top-0 left-0 w-full z-[9999]"><div className="h-1 bg-black animate-pulse w-full" /></div>}>

   <Routes>
    <Route path='/about' element={<About />}/>
    <Route path='/faq' element={<Faq />}/>
    <Route path='/privacy' element={<Legal type="privacy" />}/>
    <Route path='/terms' element={<Legal type="terms" />}/>
    <Route path='/' element={
      user ? <Navigate to="/dashboard" replace/> : <Home setUser={setUser}/>
      }/>

    <Route path='/dashboard' element={
      user ? <Dashboard user={user} setUser={setUser}/> 
      : <Navigate to="/" replace/> }/>

      <Route path='/scorer' element={
      user ? <Scorer user={user} setUser={setUser}/> 
      : <Navigate to="/" replace/> }/>

      <Route path='/resume' element={
      user ? <ResumeBuilder user={user} setUser={setUser}/> 
      : <Navigate to="/" replace/> }/>

      <Route path='/interview' element={
      user ? <InterviewStart user={user} setUser={setUser}/> 
      : <Navigate to="/" replace/> }/>

      <Route path='/interview/:id' element={
      user ? <InterviewPage user={user} setUser={setUser}/> 
      : <Navigate to="/" replace/> }/>

      <Route path='/interview/:id/report' element={
      user ? <InterviewReport user={user} setUser={setUser}/> 
      : <Navigate to="/" replace/> }/>

      <Route path='/roadmap' element={
      user ? <Roadmap user={user} setUser={setUser}/> 
      : <Navigate to="/" replace/> }/>

      <Route path='/billing' element={
      user ? <Billing user={user} setUser={setUser}/> 
      : <Navigate to="/" replace/> }/>

      <Route path='/feedback' element={
      user ? <Feedback />
      : <Navigate to="/" replace/> }/>

      <Route path='/profile' element={
      user ? <Profile user={user} setUser={setUser}/>
      : <Navigate to="/" replace/> }/>


   </Routes>
   </Suspense>
   </CreditConfirmationProvider>
  )
}

export default App
