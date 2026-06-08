import { Router } from "express";
import { registerUser, loginUser , getCurrentUser, logoutUser} from "../controllers/user.controller.js";
import {verifyjwt} from "../middlewares/auth.middleware.js";
import {verifyadmin} from "../middlewares/admin.middleware.js";

import passport from "passport";


const router = Router();
  
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
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
        secure: false
    };

return res
  .cookie("accessToken", accessToken, options)
  .redirect("https://quillforge.unitedtechlab.com/dashboard");
}
);
export default router;