import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL, {
  connectTimeout: 10_000,
  // Serverless requests must fail promptly instead of retrying Redis for minutes.
  maxRetriesPerRequest: 1,
})

redis.on("error", (err) => console.log("Redis error:", err.message))
redis.on("connect", () => console.log("Redis connected!"))

export default redis
