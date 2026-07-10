// ============================================================================
// app.js — EXPRESS APP CONFIGURATION
// ----------------------------------------------------------------------------
// This file builds and configures the Express application: security headers,
// CORS, body parsing, sessions, auth (Passport), API docs, and — most
// importantly — it mounts the two route groups that make up the whole API:
//     /api/v1/users  → user.routes.js   (signup, login, logout, OAuth, etc.)
//     /api/v1/blogs   → blog.routes.js  (blog CRUD, AI generation, likes, etc.)
//
// REQUEST FLOW (big picture):
//   incoming request
//     → global middleware here (helmet, cors, json parser, cookies, session)
//     → matched router (user.routes.js or blog.routes.js)
//     → route-level middleware (e.g. verifyjwt in auth.middleware.js)
//     → the controller function that does the real work
//     → controller talks to a Mongoose model (blog.model.js / user.model.js)
//     → controller sends the JSON response back
//   Any error thrown along the way lands in the error handler at the bottom.
//
// This file exports the configured `app` but does NOT start it — server.js does.
// ============================================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import router from "./routes/user.routes.js";       // all /users endpoints
import passport from "passport";
import blogRouter from "./routes/blog.routes.js";    // all /blogs endpoints
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Rebuild __dirname (not available by default in ES modules) so we can load the
// Swagger JSON file by absolute path regardless of where Node is launched from.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the OpenAPI/Swagger spec that powers the interactive docs at /api-docs.
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./config/swagger.json"), "utf8")
);

import session from "express-session";
import "./config/passport.js"; // side-effect import: registers the Google OAuth strategy

// Create the Express application instance.
const app = express();

// --- Security headers ---
// helmet sets a batch of sensible HTTP security headers. We relax the
// cross-origin resource policy so the frontend on a different origin can load
// resources served by this API.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// --- CORS ---
// The browser blocks cross-origin requests unless the server opts in. We allow
// exactly our local dev frontend and the deployed frontend, and `credentials:true`
// lets the browser send/receive the auth cookie across origins.
app.use(
    cors({
        origin: [
  "http://localhost:3000",
  "https://quillforge.unitedtechlab.com"
],
        credentials: true
    })
)

// --- Body / cookie parsing ---
app.use(express.json());                        // parse JSON request bodies into req.body
app.use(express.urlencoded({ extended: true })); // parse form-encoded bodies too
app.use(cookieParser());                        // parse the Cookie header into req.cookies (used to read the JWT)

// Defensive re-check: sessions need a secret. (server.js already enforces this,
// but this guards against app.js being imported in a context that skipped it.)
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

// --- Sessions ---
// Sessions are only used transiently during the Google OAuth handshake, NOT for
// normal auth (normal auth uses a JWT cookie). Hence the very short 5-minute
// cookie lifetime.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 1000 // 5 minutes — short, sessions are not used for auth
    }
  })
);

// Initialize Passport. This must run before any route that uses a Passport
// strategy. Here it enables the Google OAuth strategy configured in config/passport.js.
app.use(passport.initialize());

// --- Health-check / test route ---
// A quick way to confirm the server is up (used by uptime checks and humans).
app.get("/", (req, res) => {
    res.send("Backend Running 🚀");
});

// --- Interactive API documentation ---
// Visiting /api-docs renders a browsable UI generated from config/swagger.json.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Route groups ---
// Anything starting with /api/v1/users is handled by user.routes.js.
app.use("/api/v1/users", router);

// Anything starting with /api/v1/blogs is handled by blog.routes.js.
// (Comment left from the original author: "blog ki kahani start" = "the blog story begins".)
app.use("/api/v1/blogs", blogRouter);

// --- Global error handler ---
// Express recognizes a middleware with FOUR arguments as an error handler.
// Any error passed to next(err) — or thrown inside an asyncHandler-wrapped
// controller — ends up here, so we can return a single consistent JSON error
// shape instead of leaking stack traces. Custom ApiError instances carry their
// own statusCode; everything else falls back to 500.
app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

export default app; // handed to server.js, which calls app.listen()
