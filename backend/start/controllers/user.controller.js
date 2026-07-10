// ============================================================================
// user.controller.js — AUTH & ACCOUNT LOGIC
// ----------------------------------------------------------------------------
// Handles registration, login, logout, "who am I" (getCurrentUser), and a live
// email-validity check. These are reached via user.routes.js under /api/v1/users.
//
// Auth model: on successful login/register we issue a JWT and set it as an
// httpOnly cookie (accessToken). Later requests carry that cookie; verifyjwt
// (auth.middleware.js) reads and verifies it to identify the user.
// ============================================================================

import { asyncHandler } from "../../utilities/asynchandler.js";
import { ApiError } from "../../utilities/errors.js";
import { ApiResponse } from "../../utilities/response.js";
import User from "../../start/models/user.model.js"; // Mongoose model = door to the users collection
import dns from "dns";
import { promisify } from "util";

// validateEmail below does a real DNS MX-record lookup to check an email domain
// can actually receive mail. promisify turns the callback-style dns.resolveMx
// into an awaitable function.
const resolveMxAsync = promisify(dns.resolveMx);

// POST /api/v1/users/register  → registerUser
// Validates the three signup fields, ensures email/username aren't already taken,
// creates the user (the model hashes the password automatically on save), and
// returns the new user without the password hash.
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    // Reject missing, non-string, or blank fields (the old `field?.trim() === ""`
    // check let undefined fields slip through and crash with a 500 at the DB layer)
    if ([username, email, password].some((field) => typeof field !== "string" || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if(existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }
    const user = await User.create({ username, email, password });
    if (!user) {
        throw new ApiError(500, "Failed to create user");
    }
    const createdUser = await User.findById(user._id).select("-password");
    return res.status(201).json(new ApiResponse(201, { createdUser }, "User registered successfully"));
});

// POST /api/v1/users/login  → loginUser
// Looks up the user by email, checks the password via the model's
// isPasswordCorrect (which compares against the stored hash), then issues a JWT
// and sets it as an httpOnly accessToken cookie. That cookie is what verifyjwt
// reads on every subsequent protected request. Note the deliberately vague
// "Invalid credentials" message — it avoids revealing whether the email exists.
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }
    const user = await User.findOne({ email });
    if(!user) {
        throw new ApiError(401, "Invalid credentials");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }
    const accessToken = user.generateAccessToken();
    const options = { httpOnly: true, secure: true, sameSite: "none" };
    return res.status(200).cookie("accessToken", accessToken, options).json(
        new ApiResponse(200, { user: { _id: user._id, email: user.email, username: user.username, role: user.role } }, "Login successful")
    );
});

// GET /api/v1/users/me (protected) → getCurrentUser
// verifyjwt already attached req.user, so this just echoes it back. The frontend
// calls this on load to know if there's a valid session and who's logged in.
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
});

// POST /api/v1/users/logout → logoutUser
// There's no server-side session to destroy for JWT auth, so "logging out" simply
// clears the accessToken cookie in the browser. Options must match how it was set.
const logoutUser = asyncHandler(async(req,res)=>{
    const options = { httpOnly: true, secure: true, sameSite: "none" };
    return res.clearCookie("accessToken", options).status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

// GET /api/v1/users/validate-email?email=... → validateEmail
// A live check used by the register form: it does a DNS MX-record lookup to
// confirm the email's domain can actually receive mail, catching typos like
// "gmial.com". NOTE: this route is intentionally PUBLIC (no verifyjwt) — it runs
// before the user has an account, so requiring auth here would block signup.
const validateEmail = asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (!email) {
        throw new ApiError(400, "Email parameter is required");
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(200).json(
            new ApiResponse(200, { isValid: false, isGoogle: false, reason: "Invalid email format" }, "Invalid email format")
        );
    }

    const domain = email.split("@")[1].toLowerCase();
    const isGmailDomain = domain === "gmail.com" || domain === "googlemail.com";

    // DNS MX record check to validate the domain has mail servers
    try {
        const mxRecords = await resolveMxAsync(domain);
        const isGoogleWorkspace = mxRecords.some((record) =>
            record.exchange.toLowerCase().includes("google.com") ||
            record.exchange.toLowerCase().includes("googlemail.com")
        );
        return res.status(200).json(
            new ApiResponse(200, {
                isValid: true,
                isGoogle: isGmailDomain || isGoogleWorkspace,
                reason: isGmailDomain ? "Gmail address" : isGoogleWorkspace ? "Google Workspace domain" : "Valid email domain"
            }, "Email validated")
        );
    } catch (error) {
        return res.status(200).json(
            new ApiResponse(200, { isValid: false, isGoogle: false, reason: "Domain has no valid mail servers" }, "Domain has no mail servers")
        );
    }
});

// Export all auth controllers so user.routes.js can wire them to their routes.
export { registerUser, loginUser, getCurrentUser, logoutUser, validateEmail };