import { asyncHandler } from "../../utilities/asynchandler.js";
import {ApiError} from "../../utilities/errors.js";
import { ApiResponse } from "../../utilities/response.js";
import User from "../../start/models/user.model.js";
import dns from "dns";
import { promisify } from "util";

const resolveMxAsync = promisify(dns.resolveMx);

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

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
});

const logoutUser = asyncHandler(async(req,res)=>{
    const options = { httpOnly: true, secure: true, sameSite: "none" };
    return res.clearCookie("accessToken", options).status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

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

export { registerUser, loginUser, getCurrentUser, logoutUser, validateEmail };