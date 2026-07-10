// ============================================================================
// user.routes.js — ROUTING TABLE FOR EVERYTHING UNDER /api/v1/users
// ----------------------------------------------------------------------------
// app.js mounts this at /api/v1/users. Covers classic auth (register/login/
// logout), the "current user" check, live email validation, an admin test, and
// the Google OAuth flow. Controllers live in ../controllers/user.controller.js.
// ============================================================================

import { Router } from "express";
import { registerUser, loginUser , getCurrentUser, logoutUser, validateEmail} from "../controllers/user.controller.js";
import {verifyjwt} from "../middlewares/auth.middleware.js";     // hard auth guard
import {verifyadmin} from "../middlewares/admin.middleware.js";  // extra guard: must be role "admin"
import rateLimit from "express-rate-limit";
import passport from "passport";                                 // handles the Google OAuth strategy

// Brute-force protection on login: at most 10 attempts per 15 min per IP.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false
});

// Anti-spam on signup: at most 5 new accounts per hour per IP.
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many accounts created from this IP. Please try again after an hour." },
    standardHeaders: true,
    legacyHeaders: false
});

// Max 10 email validations per minute per IP — prevents bulk enumeration
// (i.e. someone scripting this endpoint to discover which emails are valid).
const validateEmailLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many validation requests. Please try again in a minute." },
    standardHeaders: true,
    legacyHeaders: false
});

const router = Router();

// --- Classic auth endpoints ---
router.route("/register").post(registerLimiter, registerUser); // create account
router.route("/login").post(loginLimiter, loginUser);          // sign in, sets accessToken cookie

// NOTE: no verifyjwt here — this endpoint is called from the login/register pages
// BEFORE the user has a token. It is protected by the rate limiter above instead.
router.route("/validate-email").get(validateEmailLimiter, validateEmail);

router.route("/current-user").get(verifyjwt, getCurrentUser); // "am I logged in / who am I"
router.route("/logout").post(verifyjwt, logoutUser);          // clear the auth cookie

// Admin-only smoke test: passes through verifyjwt (logged in) THEN verifyadmin
// (role === "admin"). Handy for confirming the admin guard works.
router.get(
  "/admin-test",
  verifyjwt,
  verifyadmin,
  (req, res) => {
     res.status(200).json({
      success: true,
      message: "You da real admin"
    });
  }
);

// (Author's note, roughly: "for every action except login and register you must
//  verify via JWT — only then do we know who the request is coming from.")

// --- Google OAuth flow ---
// Step 1: hitting /google redirects the user to Google's consent screen.
router.get(
  "/google",
  passport.authenticate(
    "google",
    {
      scope: ["profile", "email"]
    }
  )
);
// Step 2: Google redirects back here. Passport exchanges the code and populates
// req.user. We then mint our own JWT (same accessToken cookie as normal login)
// and redirect the browser to the admin or user dashboard based on role — so
// OAuth users end up authenticated exactly like password users.
router.get(
  "/google/callback",

  passport.authenticate(
    "google",
    {
      session: false,
      failureRedirect: "/"
    }
  ),

    async (req, res) => {

    const accessToken =
        req.user.generateAccessToken();

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none" // consistent with the rest of the auth flow
    };

    const frontendUrl = process.env.FRONTEND_URL || "https://quillforge.unitedtechlab.com";

    if (req.user.role === "admin") {
      return res
        .cookie("accessToken", accessToken, options)
        .redirect(`${frontendUrl}/admin`);
    }

    return res
      .cookie("accessToken", accessToken, options)
      .redirect(`${frontendUrl}/dashboard`);
}
);
export default router; // mounted at /api/v1/users in app.js