import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis;
let redisGaveUp = false;

const MAX_RETRY_ATTEMPTS = 3;

const memoryStore = new Map();
const createDummyRedis = () => ({
    get: async (key) => memoryStore.get(key) || null,
    set: async (key, value) => { memoryStore.set(key, value); return "OK"; },
    del: async (key) => { memoryStore.delete(key); },
    on: () => { },
    status: "disconnected",
});

if (process.env.UPSTASH_REDIS_URL) {
    try {
        let errorLogged = false;

        const client = new Redis(process.env.UPSTASH_REDIS_URL, {
            maxRetriesPerRequest: null,
            retryStrategy(times) {
                if (times > MAX_RETRY_ATTEMPTS) {
                    // Stop retrying — give up and use fallback
                    console.warn(`Redis: Failed to connect after ${MAX_RETRY_ATTEMPTS} attempts. Giving up — app will run without Redis.`);
                    redisGaveUp = true;
                    return null; // returning null stops ioredis from retrying
                }
                return Math.min(times * 200, 2000);
            },
            lazyConnect: false,
        });

        client.on("error", (err) => {
            if (!errorLogged) {
                console.error("Redis connection error:", err.message);
                errorLogged = true;
            }
        });

        client.on("connect", () => {
            console.log("redisDB Connected");
            errorLogged = false; // reset so future disconnects are logged once
            redisGaveUp = false;
        });

        // Wrap the client to handle commands gracefully when disconnected
        redis = {
            get: async (...args) => {
                if (redisGaveUp || client.status !== "ready") return null;
                try { return await client.get(...args); } catch { return null; }
            },
            set: async (...args) => {
                if (redisGaveUp || client.status !== "ready") return null;
                try { return await client.set(...args); } catch { return null; }
            },
            del: async (...args) => {
                if (redisGaveUp || client.status !== "ready") return null;
                try { return await client.del(...args); } catch { return null; }
            },
            on: (...args) => client.on(...args),
        };
    } catch (error) {
        console.error("Failed to initialize Redis client:", error.message);
        redis = null;
    }
}

if (!redis) {
    console.warn("Redis is not available. Using in-memory fallback — app runs fine without it.");
    redis = createDummyRedis();
}

export { redis };
