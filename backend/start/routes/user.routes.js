import { Router } from "express";
import { registerUser, loginUser , getCurrentUser, logoutUser} from "../controllers/user.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import passport from "passport";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/current-user").get(verifyjwt, getCurrentUser);
router.route("/logout").post(verifyjwt, logoutUser);

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