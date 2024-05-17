import express, { Router } from "express";
import * as userController from "../controllers/user-controller.js";

const publicRoute: Router = express.Router();

publicRoute.get("/", (req, res) => {
  return res.json({
    message: "Visit the site at https://chatify-frontend-ten.vercel.app/",
    contact_me: "Twitter: @agusbw_ ; IG: @agus_bw",
  });
});
publicRoute.post("/api/register", userController.registerUser);
publicRoute.post("/api/login", userController.loginUser);

export default publicRoute;
