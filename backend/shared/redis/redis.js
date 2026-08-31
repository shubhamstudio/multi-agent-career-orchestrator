import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL)

redis.on("error", (err) => console.log("Redis error:", err.message))
redis.on("connect", () => console.log("Redis connected!"))

export default redis
