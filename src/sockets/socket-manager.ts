import { Server } from "socket.io";
import { messages } from "../db/schema";
import { db } from "../db";
import { IncommingMessage } from "../utils/types";
import { ClientToServerEvents, ServerToClientEvents } from "../utils/types";

export default function initializeSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  io.on("connection", (socket) => {
    socket.on("messageSent", async (incomingMsg: IncommingMessage) => {
      try {
        const res = await db
          .insert(messages)
          .values({
            id: incomingMsg.id,
            messageText: incomingMsg.messageText,
            roomId: incomingMsg.roomId,
            senderId: incomingMsg.senderId,
          })
          .returning();

        if (res.length > 0) {
          const message = res[0];
          io.emit("incomingMessage", {
            id: message.id,
            messageText: message.messageText,
            roomId: message.roomId,
            room: {
              name: incomingMsg.room.name,
            },
            sender: {
              username: incomingMsg.sender.username,
            },
            senderId: message.senderId,
            sentAt: message.sentAt,
          });
        } else {
          socket.emit("messageNotSent", {
            error: "Failed to save message to database",
            messageId: incomingMsg.id,
          });
        }
      } catch (error) {
        console.error(
          "Error occurred while saving message to the database:",
          error
        );
        socket.emit("messageNotSent", {
          error: "An error occurred while saving message to database",
          messageId: incomingMsg.id,
        });
      }
    });
  });
}
