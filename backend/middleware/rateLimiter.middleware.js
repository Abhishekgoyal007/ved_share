import rateLimit from "express-rate-limit";

// General API rate limiter
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
        error: "Too many requests from this IP, please try again after 15 minutes",
        retryAfter: 15 * 60, // seconds
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per window
    message: {
        error: "Too many authentication attempts, please try again after 15 minutes",
        retryAfter: 15 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count all requests
});

// Very strict limiter for password reset and OTP
export const sensitiveRouteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per hour
    message: {
        error: "Too many attempts, please try again after 1 hour",
        retryAfter: 60 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// reCAPTCHA verification middleware
export const verifyCaptcha = async (req, res, next) => {
    const captchaToken = req.body.captchaToken;

    // Skip if no secret key configured (development mode)
    if (!process.env.RECAPTCHA_SECRET_KEY) {
        console.warn("reCAPTCHA not configured, skipping verification");
        return next();
    }

    // Skip if no token provided (optional captcha)
    if (!captchaToken) {
        console.warn("No captcha token provided");
        return next();
    }

    try {
        // Use an AbortController to set a strict timeout for the captcha check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

        const response = await fetch(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
            { 
                method: "POST",
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!data.success || data.score < 0.5) {
            return res.status(400).json({
                error: "Captcha verification failed. Please try again.",
                details: process.env.NODE_ENV === "development" ? data : undefined,
            });
        }

        req.captchaScore = data.score;
        next();
    } catch (error) {
        console.error("Captcha verification bypassed due to error/timeout:", error.name === 'AbortError' ? 'Timeout' : error.message);
        // In case of error or timeout, allow the request to proceed to not block the user
        next();
    }
};
