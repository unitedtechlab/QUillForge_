// its job is to load env variables, connect to the database and start express server
// more like a application bootstrap file

import dotenv from "dotenv";
import cors from "cors";
import app from "./app.js";
import connectmongo from "./db/connectmongo.js";


// Load environment variables from .env file
dotenv.config();
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "1.0.0.1"]);


// console.log("MONGODB_URI =", process.env.MONGODB_URI);
// console.log("cwd =", process.cwd());

// Connect to MongoDB and start the server
connectmongo().then(() =>{
    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code 
});
