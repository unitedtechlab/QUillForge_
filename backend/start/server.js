// its job is to load env variables, connect to the database and start express server
// more like a application bootstrap file

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import app from "./app.js";
import connectmongo from "./db/connectmongo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "1.0.0.1"]);

// Fail fast if critical env vars are missing
const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET", "JWT_EXPIRES_IN", "SESSION_SECRET", "GROQ_API_KEY"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// Connect to MongoDB and start the server
connectmongo().then(() =>{
    const PORT = process.env.PORT || 8102;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
});
