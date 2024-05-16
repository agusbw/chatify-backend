import { db } from "../../db";
import { usersToRooms, messages } from "../../db/schema";
import { eq, and, count } from "drizzle-orm";
import type { IncomingMessage, SocketHandler } from "../../utils/types";
import { incomingMessage } from "../../validations/message-validation";

export async function handleSendMessage({
  socket,
  io,
  userId,
  req,
}: SocketHandler<Omit<IncomingMessage, "sentAt">>) {
  try {
    const newMessage = incomingMessage.parse(req);
    // check if the sender still joining the room
    const isMember = await db
      .select({ count: count() })
      .from(usersToRooms)
      .where(
        and(
          eq(usersToRooms.userId, newMessage.sender.id),
          eq(usersToRooms.roomId, newMessage.room.id)
        )
      );
    if (isMember[0].count < 1) {
      throw new Error("You're not a member of this room!");
    }
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
        io.to(String(newMessage.room.id)).emit("successSendMessage", message);
      }
    } else {
      socket.emit("errorSendMessage", {
        error: "Failed to sent message",
        messageId: req.id,
      });
    }
  } catch (error) {
    let message: string | undefined;
    if (error instanceof Error) {
      message = error.message;
    }
    socket.emit("errorSendMessage", {
      error: message ? message : "Failed to send the message!",
      messageId: req.id,
    });
    console.log(error);
  }
}
