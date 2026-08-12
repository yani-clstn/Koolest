import { feedbackSchema } from "../src/assets/libs/validations/feedback.js";
import { prisma } from "../src/assets/libs/prisma.js";
import { feedbackRatelimit } from "../src/assets/libs/ratelimit.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed. Use POST.",
    });
  }

  try {
    // 1. Safe Rate Limiting
    if (feedbackRatelimit) {
      try {
        const xForwardedFor = req.headers["x-forwarded-for"];
        const clientIp = typeof xForwardedFor === "string"
          ? xForwardedFor.split(",")[0].trim()
          : req.socket?.remoteAddress || "127.0.0.1";

        const { success } = await feedbackRatelimit.limit(clientIp);
        if (!success) {
          return res.status(429).json({
            success: false,
            error: "Too many requests. Please try again later.",
          });
        }
      } catch (rateLimitErr) {
        console.warn("Rate limit error (bypassed):", rateLimitErr);
      }
    }

    // 2. Safe Parsing
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ success: false, error: "Invalid JSON format." });
      }
    }

    if (!body || typeof body !== "object") {
      return res.status(400).json({ success: false, error: "Invalid request payload." });
    }

    // 3. Validation
    const validationResult = feedbackSchema.safeParse(body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed.",
        details: validationResult.error.format(),
      });
    }

    const { name, rating, message } = validationResult.data;

    // 4. Save to Database
    const newFeedback = await prisma.feedback.create({
      data: {
        name,
        rating: Number(rating),
        message,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Feedback submitted successfully!",
      data: newFeedback,
    });
  } catch (error) {
    console.error("Feedback Handler Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message || "An unexpected error occurred.",
    });
  }
}