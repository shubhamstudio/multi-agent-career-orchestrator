import { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInterview } from '../apis/interview.api'
import Step2interview from '../components/interview/Step2interview'
import ProcessLoader from '../components/ProcessLoader'

function InterviewPage({user}) {
    const {id} = useParams()
    const [loading , setLoading] = useState(true)
    const [interview,setInterview] = useState(null)
    const navigate = useNavigate()

    useEffect(()=>{
        const fetchInterview = async () => {
            const response = await getInterview(id)
            const data = response?.interview
            if(data.status === "completed"){
                navigate(`/interview/${id}/report`,
                    {replace: true});
                    return;
            }
            setInterview(data)
            setLoading(false)
         }

         fetchInterview()

    },[id,navigate])

    if(loading){
        return <ProcessLoader type="interview" title="Setting up your interview" description="Loading your questions and interview workspace." />
    }
    if(!interview) return null
    
    return (
    <Step2interview 
    interviewData={{
        interviewId: interview._id,
        currentQuestion: interview.currentQuestion,
        totalQuestions: interview.questions.length,
        question: interview.questions[interview.currentQuestion],
    }} user={user}    />
  )
}

export default InterviewPage
