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

    return upload(`${pathnamePrefix}/${safeFilename}`, file, {
        access: "private",
        contentType: file.type || undefined,
        handleUploadUrl: `${gatewayUrl}/api/uploads/${kind}`,
        headers: {
            "x-upload-authorization": authorization,
        },
        multipart: file.size > 4 * 1024 * 1024,
    })
}
