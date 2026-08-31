import api from "../utils/axios"


export const startInterview = async (data) => {
    try {
        const response = await api.post("/api/interview/start" , data)
        return response.data
    } catch (error) {
        console.log(error)
        return null
    }
}

export const getInterview = async (id) => {
    try {
        const response = await api.get(`/api/interview/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.log(error)
        return null
    }
}


export const submitAnswer = async (data) => {
     try {
        const response = await api.post(`/api/interview/answer` , data)
       
        return response.data
    } catch (error) {
        console.log(error)
        return null
    }
}

export const getAllInterviews = async () => {
     try {
        const response = await api.get(`/api/interview/all`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.log(error)
        return null
    }
}

export const transcribeInterviewAudio = async (audioBlob) => {
    const form = new FormData()
    const extension = audioBlob.type.includes("ogg") ? "ogg" : "webm"
    form.append("audio", audioBlob, `interview-answer.${extension}`)

    const response = await api.post("/api/interview/transcribe", form, {
        timeout: 35000,
    })

    return response.data
}

export const getInterviewVoiceConnection = async () => {
    const response = await api.post("/api/interview/voice/token", null, {
        timeout: 10000,
    })

    return response.data
}
