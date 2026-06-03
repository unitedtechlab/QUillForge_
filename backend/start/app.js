import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/user.routes.js";
import passport from "passport";
import session from "express-session";
import "./config/passport.js";


// this file is responsible for setting up the express app, middlewares and routes
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "googleauth",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());

// Test Route
app.get("/", (req, res) => {
    res.send("Backend Running 🚀");
});

// Routes
app.use("/api/v1/users", router);

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});
export default app;