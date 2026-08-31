import { readFileSync } from "fs"
import { cert, initializeApp } from "firebase-admin"

if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is required")
}

const serviceAccount = JSON.parse(
    readFileSync(new URL(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, import.meta.url), "utf8")
)

export const app = initializeApp({
    credential: cert(serviceAccount),
})
