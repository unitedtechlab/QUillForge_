import { Router } from "express";
import { registerUser, loginUser , getCurrentUser} from "../controllers/user.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/current-user").get(verifyjwt, getCurrentUser);
export default router;