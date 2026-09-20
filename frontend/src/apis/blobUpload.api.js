import { upload } from "@vercel/blob/client"
import api from "../utils/axios"

const sanitizeFilename = (filename) => filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160)

export const uploadUserFile = async ({ kind, file, filename }) => {
    const authorizationResponse = await api.post(`/api/uploads/authorization/${kind}`)
    const { authorization, pathnamePrefix } = authorizationResponse.data
    const safeFilename = sanitizeFilename(filename || file.name || `${kind}-upload`)
    const gatewayUrl = api.defaults.baseURL.replace(/\/$/, "")
    // MediaRecorder reports values such as "audio/webm;codecs=opus", while
    // the server-issued Vercel Blob allowlist uses base MIME types.
    const contentType = file.type?.split(";", 1)[0] || undefined

    return upload(`${pathnamePrefix}/${safeFilename}`, file, {
        access: "private",
        contentType,
        handleUploadUrl: `${gatewayUrl}/api/uploads/${kind}`,
        headers: {
            "x-upload-authorization": authorization,
        },
        multipart: file.size > 4 * 1024 * 1024,
    })
}
