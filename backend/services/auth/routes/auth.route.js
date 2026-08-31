import express from "express";
import { getProfile, login, logout, updateProfile, useInterviewCoins } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/login",login);

authRouter.get("/logout",logout)

authRouter.post(
  "/use-coins",
  useInterviewCoins
);

authRouter.patch("/profile", updateProfile);
authRouter.get("/profile", getProfile);

export default authRouter;
