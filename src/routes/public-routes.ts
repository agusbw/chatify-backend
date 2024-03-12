import express, { Router } from "express";
import * as userController from "../controllers/user-controller";

const publicRoute: Router = express.Router();

publicRoute.post("/api/register", userController.registerUser);
publicRoute.post("/api/login", userController.loginUser);

export default publicRoute;
