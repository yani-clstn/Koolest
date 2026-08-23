import { feedbackSchema } from "../src/assets/libs/validations/feedback.js";
import { prisma } from "../src/assets/libs/prisma.js";

// Create Redis instance using Upstash REST environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// 1. Booking Limiter: Allow max 5 booking requests per 10 minutes per IP
export const bookingRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/booking",
});

// 2. Issue Reporting Limiter: Allow max 3 issue reports per 15 minutes per IP
export const issueRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/issues",
});

// 3. Feedback Limiter: Allow max 3 feedback submissions per 15 minutes per IP
export const feedbackRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/feedback",
});