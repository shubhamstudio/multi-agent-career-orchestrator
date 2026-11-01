import axios from "axios"

// Production requests go through the frontend's /api rewrite so sessions are
// first-party cookies on every browser, including iOS and Android.
const baseURL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "")

const api = axios.create({
    baseURL,
    withCredentials: true

})

export default api
