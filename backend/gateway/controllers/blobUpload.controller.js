import crypto from "crypto"
import { handleUpload } from "@vercel/blob/client"
import redis from "../utils/redis.js"

const UPLOAD_AUTHORIZATION_TTL_SECONDS = 5 * 60

const uploadConfigs = {
    resume: {
        allowedContentTypes: ["application/pdf"],
        maximumSizeInBytes: 20 * 1024 * 1024,
        pathnamePrefix: "resumes",
    },
    "interview-audio": {
        allowedContentTypes: [
            "audio/flac",
            "audio/mp4",
            "audio/mpeg",
            "audio/ogg",
            "audio/wav",
            "audio/webm",
            "video/webm",
        ],
        maximumSizeInBytes: 10 * 1024 * 1024,
        pathnamePrefix: "interview-audio",
    },
}

const getUploadConfig = (kind) => uploadConfigs[kind]

const authorizationKey = (value) => `blob-upload:${value}`

export const createUploadAuthorization = async (req, res) => {
    const config = getUploadConfig(req.params.kind)
    if (!config) {
        return res.status(404).json({ message: "Unsupported upload type" })
    }

    const authorization = crypto.randomUUID()
    const userId = String(req.user.userId)
    const pathnamePrefix = `${config.pathnamePrefix}/${userId}`

    await redis.set(
        authorizationKey(authorization),
        JSON.stringify({ kind: req.params.kind, pathnamePrefix }),
        "EX",
        UPLOAD_AUTHORIZATION_TTL_SECONDS
    )

    return res.status(200).json({
        success: true,
        authorization,
        pathnamePrefix,
    })
}

export const handleBlobUpload = async (req, res) => {
    const config = getUploadConfig(req.params.kind)
    if (!config) {
        return res.status(404).json({ message: "Unsupported upload type" })
    }

    const isTokenRequest = req.body?.type === "blob.generate-client-token"
    let uploadAuthorization

    if (isTokenRequest) {
        const authorization = req.get("x-upload-authorization")
        const serializedAuthorization = authorization && await redis.get(authorizationKey(authorization))

        if (!serializedAuthorization) {
            return res.status(401).json({ message: "Upload authorization expired" })
        }

        uploadAuthorization = JSON.parse(serializedAuthorization)
        if (uploadAuthorization.kind !== req.params.kind) {
            return res.status(401).json({ message: "Upload authorization does not match this file type" })
        }
    }

    try {
        const response = await handleUpload({
            body: req.body,
            request: req,
            onBeforeGenerateToken: async (pathname) => {
                if (!uploadAuthorization || !pathname.startsWith(`${uploadAuthorization.pathnamePrefix}/`)) {
                    throw new Error("Invalid upload path")
                }

                await redis.del(authorizationKey(req.get("x-upload-authorization")))

                return {
                    allowedContentTypes: config.allowedContentTypes,
                    maximumSizeInBytes: config.maximumSizeInBytes,
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({ kind: req.params.kind }),
                }
            },
            onUploadCompleted: async () => {
                // Persistence happens only after processing succeeds, so the Blob URL and result stay together.
            },
        })

        return res.status(200).json(response)
    } catch (error) {
        console.error("Blob upload token error", error.message)
        return res.status(400).json({ message: "Unable to authorize this upload" })
    }
}
