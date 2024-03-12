import express, { Router } from "express";
import * as userController from "../../controllers/user-controller";

const publicRoute: Router = express.Router();

publicRoute.post("/api/register", userController.registerUser);

export default publicRoute;
