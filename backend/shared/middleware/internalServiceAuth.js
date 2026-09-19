import crypto from "crypto"

const INTERNAL_API_KEY_HEADER = "x-internal-api-key"

/**
 * Keeps independently deployed services from accepting browser-originated
 * requests that forge the gateway's user headers.
 */
export const requireInternalServiceKey = (req, res, next) => {
    const expectedKey = process.env.INTERNAL_SERVICE_API_KEY
    const receivedKey = req.get(INTERNAL_API_KEY_HEADER)

    if (!expectedKey) {
        return res.status(500).json({ message: "Internal service authentication is not configured" })
    }

    const expected = Buffer.from(expectedKey)
    const received = Buffer.from(receivedKey || "")
    const isValid = expected.length === received.length
        && crypto.timingSafeEqual(expected, received)

    if (!isValid) {
        return res.status(401).json({ message: "Unauthorized service request" })
    }

    next()
}
