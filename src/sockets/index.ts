import { Server } from "socket.io";
import { usersToRooms } from "../db/schema";
import { db } from "../db";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../utils/types";
import { eq } from "drizzle-orm";
import {
  handleCreateRoom,
  handleJoinRoom,
  handleDeleteRoom,
  handleLeaveRoom,
} from "./handlers/room-handler";
import { handleKickMember } from "./handlers/member-handler";
import { handleSendMessage } from "./handlers/message-handler";

export default function initializeSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  io.on("connection", async (socket) => {
    // dapetin user id dari params yang dikirim client
    const userId = Number(socket.handshake.query.userId);

    if (!userId) {
      console.error("User ID is missing or invalid. Disconnecting socket.");
      socket.disconnect(true); // Force disconnect
      return;
    }

    try {
      // dapetin semua room yang dijoinin sm si client, lalu masukin ke socket room masing2 roomId
      const userRooms = await db.query.usersToRooms.findMany({
        where: eq(usersToRooms.userId, userId),
        with: {
          room: true,
        },
        columns: {},
      });

      userRooms.forEach((data) => {
        socket.join(String(data.room.id));
      });

      socket.on("sendMessage", async (req) => {
        handleSendMessage({ socket, io, req, userId });
      });

      socket.on("kickMember", async (req) => {
        handleKickMember({ socket, io, req, userId });
      });

      socket.on("createRoom", async (req) => {
        handleCreateRoom({ socket, io, req, userId });
      });

      socket.on("joinRoom", async (req) => {
        handleJoinRoom({ socket, io, req, userId });
      });

      socket.on("leaveRoom", async (req) => {
        handleLeaveRoom({ socket, io, req, userId });
      });

      socket.on("deleteRoom", async (req) => {
        handleDeleteRoom({ socket, io, req, userId });
      });
    } catch (error) {
      console.error("Error fetching user rooms:", error);
    }
  });
}
