import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create rate limiter
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "15 m"), // 100 requests per 15 minutes
  analytics: true,
});

// Helper to get rate limit key
export function getRateLimitKey(identifier: string, resource: string) {
  return `ratelimit:${resource}:${identifier}`;
}
