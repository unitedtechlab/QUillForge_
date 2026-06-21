import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/user.routes.js";
import passport from "passport";
import blogRouter from "./routes/blog.routes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./config/swagger.json"), "utf8")
);

//function of passport is to handle authentication and authorization in our application,
//  it provides a simple and consistent API for handling different authentication strategies, such as local username/password, Google OAuth, Facebook OAuth, etc.
//we can use  passport function by passport.initialize() middleware, which initializes the passport middleware and allows us to use it in our routes for authentication
//  and authorization purposes.
import session from "express-session";
import "./config/passport.js";


// this whole file is responsible for setting up the express app, middlewares and routes
const app = express();

// Middlewares
app.use(
    cors({
        origin: [
  "http://localhost:3000",
  "https://quillforge.unitedtechlab.com"
],
        credentials: true
    })  
)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_dev_only_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 1000 // 5 minutes — short, sessions are not used for auth
    }
  })
);

app.use(passport.initialize());
// what above line does is it initializes the passport middleware, which is required to use any of the passport strategies,
//  in our case we are using Google OAuth strategy, so we need to initialize passport before using it in our routes.


// Test Route
app.get("/", (req, res) => {
    res.send("Backend Running 🚀");
});

// Swagger UI Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/v1/users", router);



// blog ki kahani start : 


app.use("/api/v1/blogs", blogRouter);






app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});



export default app;