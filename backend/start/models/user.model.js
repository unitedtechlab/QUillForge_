// ============================================================================
// models/user.model.js — USER ACCOUNT DATABASE SCHEMA
// ----------------------------------------------------------------------------
// Defines the shape of every user document stored in the "users" MongoDB
// collection. Used by:
//   • user.controller.js  — register, login, logout, profile, validateEmail
//   • auth.middleware.js  — verifyjwt fetches user by _id decoded from token
//   • quota.middleware.js — reads aiQuota to gate AI generation access
//   • ai.controller.js   — increments aiQuota.generationsCount on success
//   • passport.js        — creates/finds users on Google OAuth callback
//
// RELATED ROUTES (user.routes.js):
//   POST /api/v1/users/register         → registerUser  (creates a new user doc)
//   POST /api/v1/users/login            → loginUser     (calls isPasswordCorrect + generateAccessToken)
//   POST /api/v1/users/logout           → logoutUser    (clears accessToken cookie)
//   GET  /api/v1/users/current-user     → currentUser   (returns req.user populated by verifyjwt)
//   GET  /api/v1/users/google           → passport redirect to Google OAuth page
//   GET  /api/v1/users/google/callback  → passport callback → generateAccessToken → set cookie
// ============================================================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';       // used in the pre-save hook and isPasswordCorrect method
import jwt from 'jsonwebtoken';      // used in generateAccessToken method
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env so JWT_SECRET and JWT_EXPIRES_IN are available at module import time
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const userSchema = new mongoose.Schema({
        // Primary login identifier. Stored lowercase so 'User@Email.com' and
        // 'user@email.com' are always treated as the same account.
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // Public display name. Also used as the author credit on blog posts.
        // For Google OAuth users, derived from profile.displayName (passport.js).
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        // Hashed by the pre-save hook below. Optional because Google OAuth users
        // don't set a password — they authenticate entirely through Google.
        password: {
            type: String,
        },

        // Unique Google account identifier stored after a successful OAuth login.
        // sparse: true means the unique index only applies to docs where the field
        // exists, so users who signed up with email/password (no googleId) don't conflict.
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },

        // Controls access levels across the application:
        //   "user"  — default, limited to 3 AI generations/month (quota.middleware.js)
        //   "pro"   — unlimited AI generations, no quota check
        //   "admin" — unlimited AI generations + admin dashboard access (admin.middleware.js)
        role: {
            type: String,
            enum: ["user", "admin", "pro"],
            default: "user"
        },

        // Tracks monthly AI blog generation usage for free-tier "user" accounts.
        // Checked and incremented in quota.middleware.js + ai.controller.js.
        aiQuota: {
            // How many AI blogs this user has generated in the current billing month.
            generationsCount: {
                type: Number,
                default: 0
            },
            // The date when the count resets back to 0 (automatically set to +1 month
            // on account creation and after each monthly reset in quota.middleware.js).
            resetDate: {
                type: Date,
                default: () => {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    return nextMonth;
                }
            }
        }
    }, {
        timestamps: true  // auto-adds createdAt and updatedAt to every user doc
    });

// ─── PRE-SAVE HOOK ─────────────────────────────────────────────────────────
// Runs automatically BEFORE any User.save() call.
// Hashes the raw password with bcrypt (10 salt rounds) only when the password
// field has actually changed — prevents re-hashing an already-hashed string.
// Google OAuth users have no password, so the guard `!this.password` skips them.
userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) {
        return; // skip — password unchanged or not set (Google OAuth user)
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// ─── INSTANCE METHOD: isPasswordCorrect ────────────────────────────────────
// Called inside loginUser controller to compare the plain-text password the
// user typed with the bcrypt hash stored in the DB.
// Returns: true if passwords match, false otherwise.
// API: POST /api/v1/users/login → user.controller.js → loginUser
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(
        password,      // plain text from request body
        this.password  // hashed string stored in MongoDB
    );
};

// ─── INSTANCE METHOD: generateAccessToken ──────────────────────────────────
// Creates a signed JWT containing the user's _id, email, username, and role.
// The token is sent to the browser as an httpOnly cookie (res.cookie) in:
//   • loginUser controller     → POST /api/v1/users/login
//   • Google OAuth callback    → GET  /api/v1/users/google/callback
// The token is then read back by verifyjwt middleware on every protected route
// to re-identify the user without hitting the database on every request.
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,          // decoded by verifyjwt → User.findById(decoded._id)
            email: this.email,
            username: this.username,
            role: this.role         // decoded role used by admin.middleware.js
        },
        process.env.JWT_SECRET,           // signing secret from .env
        {
            expiresIn: process.env.JWT_EXPIRES_IN  // e.g. "7d" — token lifetime from .env
        }
    );
};

const User = mongoose.model('User', userSchema);

export default User;