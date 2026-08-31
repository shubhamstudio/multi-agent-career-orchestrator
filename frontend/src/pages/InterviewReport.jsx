import { useEffect, useState } from 'react'
import Step3report from '../components/interview/Step3report'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getInterview } from '../apis/interview.api'
import ProcessLoader from '../components/ProcessLoader'

function InterviewReport({user, setUser}) {
  const {id} = useParams()
    const [loading , setLoading] = useState(true)
    const [report,setReport] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()
    const reportBackTarget = location.state?.from === "/feedback" ? "/feedback" : "/dashboard"

    useEffect(()=>{
        const fetchReport = async () => {
            const response = await getInterview(id)
            const data = response?.interview
            if(data.status !== "completed"){
                navigate(`/interview/${id}`,
                    {replace: true});
                    return;
            }
            setReport(data)
            setLoading(false)
         }

         fetchReport()

    },[id,navigate])

    if(loading){
        return <ProcessLoader type="report" title="Building your report" description="Collecting your answers and feedback scores." />
    }
    if(!report) return null


  return (
   <Step3report
   user={user}
   setUser={setUser}
   report={report}
   onBack={() => navigate(reportBackTarget)}
   />
  )
}

export default InterviewReport
