import express, { Router } from "express";
import { authenticateJWT } from "../middleware/auth-middleware";

const protectedRoute: Router = express.Router();

protectedRoute.use(authenticateJWT);

protectedRoute.get("/api/protected", (req, res) => {
  res.json({
    message: "authenticated",
  });
});

export default protectedRoute;
