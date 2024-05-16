import express, { Router } from "express";
import { authenticateJWT } from "../middleware/auth-middleware";
import * as roomController from "../controllers/room-controller";
import * as messageController from "../controllers/message-controller";

const protectedRoute: Router = express.Router();

protectedRoute.use(authenticateJWT);

protectedRoute.get("/api/verify-token", (req, res) => {
  res.json({
    message: "authenticated",
  });
});

protectedRoute.post("/api/rooms", roomController.createRoom);
protectedRoute.get("/api/rooms", roomController.getUserJoinedRooms);
protectedRoute.post("/api/rooms/join", roomController.joinRoom);
protectedRoute.get("/api/rooms/:roomId", roomController.getRoomById);
protectedRoute.delete("/api/rooms/:roomId", roomController.deleteRoom);
protectedRoute.delete("/api/rooms/:roomId/leave", roomController.leaveRoom);

// need realtime data, move to socket handler
// protectedRoute.delete(
//   "/api/rooms/:roomId/member/:memberId",
//   roomController.kickMember
// );

protectedRoute.patch(
  "/api/rooms/:roomId/refresh-code",
  roomController.refreshCode
);
protectedRoute.get(
  "/api/rooms/:roomId/messages",
  messageController.getMessagesByRoomId
);

export default protectedRoute;
