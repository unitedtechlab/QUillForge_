import { ApiError } from "../../utilities/errors.js";
import { asyncHandler } from "../../utilities/asynchandler.js";
import User from "../models/user.model.js";

export const verifyAiLimit = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Admin and Pro users bypass quotas
  if (user.role === "admin" || user.role === "pro") {
    return next();
  }

  const now = new Date();

  // Reset monthly quota if current date is past the resetDate
  if (now > user.aiQuota.resetDate) {
    user.aiQuota.generationsCount = 0;

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    user.aiQuota.resetDate = nextMonth;
    await user.save();
  }

  // Limit Free users to 3 generations
  if (user.aiQuota.generationsCount >= 3) {
    throw new ApiError(403, "Free plan limit reached (3 AI blogs/month). Upgrade to Pro for unlimited writing!");
  }

  // We increment user.aiQuota.generationsCount inside the generation controller
  // once the generation successfully finishes, to avoid charging the user if the call fails.
  next();
});
