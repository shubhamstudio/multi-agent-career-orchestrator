import { cert, getApps, initializeApp } from "firebase-admin"

if (!process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_B64 is required")
}

let serviceAccount
try {
    serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf8")
    )
} catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_B64 must contain base64-encoded service-account JSON")
}

export const app = getApps()[0] || initializeApp({
    credential: cert(serviceAccount),
})
