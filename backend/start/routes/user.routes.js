import { Router } from "express";
import { registerUser, loginUser , getCurrentUser} from "../controllers/user.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import passport from "passport";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/current-user").get(verifyjwt, getCurrentUser);

console.log("Registering Google route");

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
        secure: false
    };

    return res
        .cookie(
            "accessToken",
            accessToken,
            options
        )
        .json({
            success: true,
            message: "Google Login Success",
            user: req.user
        });
}
);
export default router;