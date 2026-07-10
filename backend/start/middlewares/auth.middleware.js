// ============================================================================
// auth.middleware.js — AUTHENTICATION GUARDS
// ----------------------------------------------------------------------------
// These middleware functions run BEFORE a controller to establish "who is
// making this request". They read the JWT (JSON Web Token) that login issued,
// verify it, look up the matching user, and attach that user to req.user so the
// controller can use it.
//
// Two flavours are exported:
//   verifyjwt    — HARD guard: no valid token → 401, request never reaches controller.
//                  Used on routes that require login (create/update/delete blog, etc.)
//   optionalAuth — SOFT guard: attaches req.user if a valid token exists, but lets
//                  anonymous requests through untouched. Used on public routes that
//                  behave a little differently for logged-in users (e.g. GET /blogs
//                  shows an author their own drafts).
// ============================================================================

import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ApiError } from '../../utilities/errors.js';
import { asyncHandler } from '../../utilities/asynchandler.js';

// asyncHandler wraps the function so that any thrown error (including jwt.verify
// throwing on a bad/expired token) is automatically forwarded to the global
// error handler in app.js — no try/catch needed here.
const verifyjwt = asyncHandler(async (req, res, next) => {

    // The token can arrive two ways: as an httpOnly cookie (browser, normal case)
    // or as an "Authorization: Bearer <token>" header (API clients / tests).
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    // No token at all → the caller is not authenticated. Reject with 401.
    if (!token) {
        throw new ApiError(401, "unauthenticated");
    }

    // Verify the signature and expiry. If the token was tampered with or has
    // expired, jwt.verify throws, and asyncHandler routes it to the error handler.
    // The decoded payload is whatever we signed at login time: _id, email, username.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up the actual user record (minus the password hash). We re-fetch from
    // the DB rather than trusting the token blindly, so that e.g. a deleted user's
    // old token stops working immediately.
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
        throw new ApiError(401, "unauthenticated");
    }

    // Attach the user to the request so downstream controllers can read req.user
    // (e.g. to set the blog's author, or check admin role).
    req.user = user;

    next(); // hand control to the next middleware / the controller
});

export { verifyjwt };

// Optional authentication: attaches req.user if a valid token is present,
// but NEVER rejects the request. Used on public routes (e.g. GET /blogs)
// where logged-in authors should additionally see their own drafts.
const optionalAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    // No token → carry on as an anonymous visitor (this is the key difference
    // from verifyjwt, which would throw here).
    if (!token) return next();

    try {
        // Same verification as verifyjwt, but wrapped in try/catch so a bad token
        // doesn't break a public page — we simply treat the visitor as anonymous.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id).select("-password");
        if (user) req.user = user;
    } catch (err) {
        // Invalid/expired token on a public route — just treat as anonymous.
    }

    next();
});

export { optionalAuth };
