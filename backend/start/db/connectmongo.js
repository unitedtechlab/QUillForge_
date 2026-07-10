// ============================================================================
// db/connectmongo.js — MONGODB CONNECTION INITIALISER
// ----------------------------------------------------------------------------
// Establishes the single Mongoose connection to the MongoDB Atlas cluster.
// Called once at application startup from server.js BEFORE the HTTP server
// starts listening, so the server never accepts requests without a live DB.
//
// STARTUP SEQUENCE IN server.js:
//   1. Validate required env vars
//   2. connectmongo()  ← this file
//   3. app.listen()
//
// CONNECTION STRING:
//   Reads MONGODB_URI from the .env file (or Docker env vars in production).
//   Format: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbName>
//   The cluster is hosted on MongoDB Atlas (see .env or GitHub Secrets).
//
// ERROR HANDLING:
//   If the connection fails (wrong URI, network issue, wrong credentials),
//   the process exits with code 1 so the Docker container restarts automatically
//   (--restart unless-stopped flag in backend-deploy.yml) rather than running
//   in a broken state where every DB call would fail silently.
// ============================================================================

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly so this file works both when imported by server.js
// and when run standalone (e.g. for DB migration scripts).
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connectmongo = async () => {
  try {
    // mongoose.connect() returns a promise. The options object is empty because
    // Mongoose 7+ enables the new connection engine by default.
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // exit with error code so Docker/PM2 restarts the container
  }
};

export default connectmongo;