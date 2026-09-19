import api from "../utils/axios"
import { uploadUserFile } from "./blobUpload.api"


export const startInterview = async (data) => {
    const response = await api.post("/api/interview/start", data, { timeout: 300000 })
    return response.data
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

export const transcribeInterviewAudio = async (audioBlob, interviewId) => {
    const extension = audioBlob.type.includes("ogg") ? "ogg" : "webm"
    const filename = `interview-answer.${extension}`
    const blob = await uploadUserFile({
        kind: "interview-audio",
        file: audioBlob,
        filename,
    })

    const response = await api.post("/api/interview/transcribe", {
        blobUrl: blob.url,
        interviewId,
        filename,
    }, {
        timeout: 300000,
    })

    return response.data
}

export const getInterviewVoiceConnection = async () => {
    const response = await api.post("/api/interview/voice/token", null, {
        timeout: 10000,
    })

    return response.data
}
