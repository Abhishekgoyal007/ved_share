import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis;

try {
    if (process.env.UPSTASH_REDIS_URL) {
        redis = new Redis(process.env.UPSTASH_REDIS_URL);
        redis.on('error', (err) => {
            console.error("Redis connection error:", err.message);
        });
        console.log("redisDB Connected");
    } else {
        console.warn("UPSTASH_REDIS_URL is not defined. Redis features will be disabled.");
        // Create a dummy redis object to prevent crashes in controllers
        redis = {
            get: async () => null,
            set: async () => null,
            del: async () => null,
            on: () => { },
        };
    }
} catch (error) {
    console.error("Failed to initialize Redis:", error.message);
    redis = {
        get: async () => null,
        set: async () => null,
        del: async () => null,
        on: () => { },
    };
}

export { redis };
