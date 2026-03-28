import { Router } from "express";
import { registerUser } from "../utils/registrationUtils.js";
import { loginUser, logoutUser } from "../utils/authentificationUtils.js";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);

export default authRouter;