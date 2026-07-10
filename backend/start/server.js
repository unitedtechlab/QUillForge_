// ============================================================================
// server.js — APPLICATION BOOTSTRAP / ENTRY POINT
// ----------------------------------------------------------------------------
// This is the very first file Node runs (see "start" script in package.json).
// Its only responsibilities are:
//   1. Load environment variables from the .env file
//   2. Verify the critical env vars actually exist (fail fast if not)
//   3. Open the MongoDB connection
//   4. Start the Express HTTP server listening for requests
//
// The actual Express app (routes, middleware, etc.) lives in app.js — this file
// just imports that configured app and switches it on. Keeping bootstrap logic
// separate from app config makes the app easy to import in tests without
// actually opening a port.
// ============================================================================

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import app from "./app.js";                 // the fully-configured Express app (see app.js)
import connectmongo from "./db/connectmongo.js"; // helper that opens the Mongoose connection

// In ES modules there is no __dirname built in, so we reconstruct it from the
// current file's URL. We need it below to build an absolute path to the .env file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file that sits one level up (backend/.env).
// After this line, process.env.MONGODB_URI etc. are available everywhere in the app.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Force DNS lookups to use Cloudflare's resolvers (1.1.1.1). Some hosts have flaky
// default DNS which can break the MongoDB Atlas SRV connection string lookup; this
// makes the DB connection more reliable.
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "1.0.0.1"]);

// Fail fast if critical env vars are missing.
// Rationale: it is far better to crash immediately on startup with a clear message
// than to boot "successfully" and then throw confusing errors later when a request
// tries to use a missing secret. NOTE: GROQ_API_KEY is required here — if the
// deployed server's environment lacks it, the process exits and Nginx returns 502.
const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET", "JWT_EXPIRES_IN", "SESSION_SECRET", "GROQ_API_KEY"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1); // stop the process with a non-zero (error) exit code
  }
}

// Connect to MongoDB first, and only start accepting HTTP requests once the DB is up.
// If we started the server before the DB was ready, early requests could fail.
connectmongo().then(() =>{
    const PORT = process.env.PORT || 8102; // use the configured port, or 8102 as a fallback

    // app.listen actually opens the TCP port and begins handling incoming requests.
    // From here on, requests flow into app.js → the matching router → controller.
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    // If the DB connection fails, there is no point running the server — exit with an error.
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
});
