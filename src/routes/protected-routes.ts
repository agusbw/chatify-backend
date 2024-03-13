import express, { Router } from "express";
import { authenticateJWT } from "../middleware/auth-middleware";
import * as roomController from "../controllers/room-controller";

const protectedRoute: Router = express.Router();

protectedRoute.use(authenticateJWT);

protectedRoute.get("/api/verify-token", (req, res) => {
  res.json({
    message: "authenticated",
  });
});

protectedRoute.post("/api/rooms", roomController.createRoom);
protectedRoute.get("/api/rooms", roomController.getUserJoinedRooms);

export default protectedRoute;
