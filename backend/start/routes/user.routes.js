import { Router } from "express";
import { registerUser, loginUser , getCurrentUser, logoutUser, validateEmail} from "../controllers/user.controller.js";
import {verifyjwt} from "../middlewares/auth.middleware.js";
import {verifyadmin} from "../middlewares/admin.middleware.js";
import rateLimit from "express-rate-limit";
import passport from "passport";

// Max 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false
});

// Max 5 registrations per hour per IP
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many accounts created from this IP. Please try again after an hour." },
    standardHeaders: true,
    legacyHeaders: false
});

const router = Router();
  
router.route("/register").post(registerLimiter, registerUser);
router.route("/login").post(loginLimiter, loginUser);
router.route("/validate-email").get(validateEmail);
router.route("/current-user").get(verifyjwt, getCurrentUser);
router.route("/logout").post(verifyjwt, logoutUser);

router.get(
  "/admin-test",
  verifyjwt,
  verifyadmin,
  (req, res) => {
     res.status(200).json({
      success: true,
      message: "You da real admin"
    });
  }
);

// login and regiter ke alava har action ke liye jwt se verfify hona padega tabhi pta chalega req kaha se aari hai 

router.get(
  "/google",
  passport.authenticate(
    "google",
    {
      scope: ["profile", "email"]
    }
  )
);
router.get(
  "/google/callback",

  passport.authenticate(
    "google",
    {
      session: false,
      failureRedirect: "/"
    }
  ),

    async (req, res) => {

    const accessToken =
        req.user.generateAccessToken();

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none" // consistent with the rest of the auth flow
    };

if (req.user.role === "admin") {
  return res
    .cookie("accessToken", accessToken, options)
    .redirect("https://quillforge.unitedtechlab.com/admin");
}

return res
  .cookie("accessToken", accessToken, options)
  .redirect("https://quillforge.unitedtechlab.com/dashboard");
}
);
export default router;