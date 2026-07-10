// ============================================================================
// middlewares/quota.middleware.js — AI GENERATION RATE LIMITER (MONTHLY QUOTA)
// ----------------------------------------------------------------------------
// Runs AFTER verifyjwt on the AI generation route to enforce the free-tier
// monthly limit before the Gemini API call is even attempted.
//
// QUOTA RULES:
//   • "admin" or "pro" users → bypass quota entirely, always allowed.
//   • "user" (free tier)     → maximum 3 AI blog generations per calendar month.
//
// MONTHLY RESET LOGIC:
//   The user document stores aiQuota.resetDate (set to +1 month on signup).
//   Each time this middleware runs it compares now > resetDate and, if true,
//   resets generationsCount to 0 and pushes resetDate forward by one more month.
//   This lazy reset avoids needing a cron job.
//
// DEFERRED INCREMENT DESIGN:
//   This middleware does NOT increment generationsCount itself. Incrementing
//   only happens inside ai.controller.js AFTER the Gemini call succeeds.
//   This ensures a user is never charged a quota slot for a failed API call.
//
// USED BY (blog.routes.js):
//   POST /api/v1/blogs/generate → [verifyjwt, verifyAiLimit, generateBlogContent]
// ============================================================================

import { ApiError } from "../../utilities/errors.js";
import { asyncHandler } from "../../utilities/asynchandler.js";
import User from "../models/user.model.js";

export const verifyAiLimit = asyncHandler(async (req, res, next) => {
  // Re-fetch user from DB to get the freshest quota values (not just the JWT payload).
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Admin and Pro users bypass quotas — no limit check needed.
  if (user.role === "admin" || user.role === "pro") {
    return next();
  }

  const now = new Date();

  // LAZY MONTHLY RESET: if the billing period has elapsed, zero the counter
  // and schedule the next reset for one month from now.
  if (now > user.aiQuota.resetDate) {
    user.aiQuota.generationsCount = 0;

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    user.aiQuota.resetDate = nextMonth;
    await user.save();
  }

  // Hard cap: free users may only generate 3 AI blogs per month.
  // The counter is incremented in ai.controller.js once the generation succeeds.
  if (user.aiQuota.generationsCount >= 3) {
    throw new ApiError(403, "Free plan limit reached (3 AI blogs/month). Upgrade to Pro for unlimited writing!");
  }

  // Quota not exceeded — let the request through to the AI controller.
  next();
});

