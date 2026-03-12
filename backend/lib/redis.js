import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis;

if (process.env.UPSTASH_REDIS_URL) {
    try {
        const client = new Redis(process.env.UPSTASH_REDIS_URL, {
            maxRetriesPerRequest: null, // Avoid error: "Reached the max retries per request limit"
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        client.on("error", (err) => {
            console.error("Redis connection error:", err.message);
        });

        client.on("connect", () => {
            console.log("redisDB Connected");
        });

        // Wrap the client to handle commands gracefully when disconnected
        redis = {
            get: async (...args) => {
                if (client.status !== "ready") return null;
                try { return await client.get(...args); } catch { return null; }
            },
            set: async (...args) => {
                if (client.status !== "ready") return null;
                try { return await client.set(...args); } catch { return null; }
            },
            del: async (...args) => {
                if (client.status !== "ready") return null;
                try { return await client.del(...args); } catch { return null; }
            },
            on: (...args) => client.on(...args),
        };
    } catch (error) {
        console.error("Failed to initialize Redis client:", error.message);
        process.env.UPSTASH_REDIS_URL = null; // Force fallback
    }
}

if (!process.env.UPSTASH_REDIS_URL || !redis) {
    console.warn("Redis is not available or failed to initialize. Using dummy fallback.");
    redis = {
        get: async () => null,
        set: async () => null,
        del: async () => null,
        on: () => { },
        status: "disconnected"
    };
}

export { redis };
