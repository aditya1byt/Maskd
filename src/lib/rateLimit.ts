/**
 * In-memory rate limiter for API route protection.
 * Tracks request counts per identifier (typically IP) within a fixed time window.
 * Stale entries are cleaned up automatically when the store grows too large.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Prevent unbounded memory growth — clean up when store exceeds this size
const MAX_STORE_SIZE = 10000;

function cleanupStaleEntries() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Check whether the given identifier is within its rate limit.
 *
 * @param identifier  Unique key (e.g. IP address)
 * @param limit       Max requests allowed within the window (default 5)
 * @param windowMs    Window duration in milliseconds (default 60 000 = 1 min)
 * @returns           { allowed, remaining } — whether the request is permitted
 */
export function checkRateLimit(
    identifier: string,
    limit: number = 5,
    windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number } {
    const now = Date.now();

    // Periodic cleanup to prevent memory leak
    if (rateLimitStore.size > MAX_STORE_SIZE) {
        cleanupStaleEntries();
    }

    const entry = rateLimitStore.get(identifier);

    // First request or window has expired — reset
    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: limit - 1 };
    }

    // Limit exceeded
    if (entry.count >= limit) {
        return { allowed: false, remaining: 0 };
    }

    // Increment and allow
    entry.count++;
    return { allowed: true, remaining: limit - entry.count };
}
