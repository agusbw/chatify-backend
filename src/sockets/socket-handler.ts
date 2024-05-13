import { Server } from "socket.io";
import { messages } from "../db/schema";
import { db } from "../db";
import { ClientToServerEvents, ServerToClientEvents } from "../utils/types";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { incomingMessage } from "../validations/message-validation";

export default function initializeSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap>
) {
  io.on("connection", (socket) => {
    socket.on("sendMessage", async (req) => {
      try {
        const newMessage = incomingMessage.parse(req);
        const res = await db
          .insert(messages)
          .values({
            messageText: newMessage.messageText,
            id: newMessage.id,
            roomId: newMessage.room.id,
            senderId: newMessage.sender.id,
            sentAt: new Date(),
          })
          .returning();

        if (res.length > 0) {
          const message = await db.query.messages.findFirst({
            with: {
              room: {
                columns: {
                  name: true,
                  id: true,
                },
              },
              sender: {
                columns: {
                  username: true,
                  id: true,
                },
              },
            },
            columns: {
              id: true,
              messageText: true,
              sentAt: true,
            },
            where: (messages, { eq }) => eq(messages.id, newMessage.id),
          });

          if (message) {
            io.emit("successSendMessage", message);
          }
        } else {
          socket.emit("errorSendMessage", {
            error: "Failed to sent message",
            messageId: req.id,
          });
        }
      } catch (error) {
        console.error(
          "Error occurred while saving message to the database:",
          error
        );
        socket.emit("errorSendMessage", {
          error: "Failed to sent message",
          messageId: req.id,
        });
      }
    });
  });
}
