import api from "../utils/axios"

export const getCurrentUser = async () => {
    try {
        const response = await api.get("/api/auth/profile")
        return response.data
    } catch {
        
        return null
    }
}

export const spendCoins = async (data)=>{
    try {
        const response = await api.post("/api/auth/use-coins" , data)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.log(error)
        
        throw error;
    }
}

export const updateProfile = async (data) => {
    const response = await api.patch("/api/auth/profile", data)
    return response.data
}
