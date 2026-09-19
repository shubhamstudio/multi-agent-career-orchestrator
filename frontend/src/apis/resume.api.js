import api from "../utils/axios"



export const getResume = async () => {
    try {
        const response = await api.get("/api/resume/get-resume", { timeout: 10_000 })
        
        return response.data
    } catch {
     
        return null
    }
    
}
