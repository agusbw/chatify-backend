import { db } from "../db";
import { messages, usersToRooms } from "../db/schema";
import { eq, asc, and } from "drizzle-orm";
import * as messageValidation from "../validations/message-validation";
import { Request } from "express";
import ResponseError from "../utils/response-error";
import validate from "../validations";

export async function getMessagesByRoomId(req: Request) {
  const { roomId } = validate(messageValidation.roomIdParams, req, "params");

  const isMember = await db.query.usersToRooms.findFirst({
    where: and(
      eq(usersToRooms.userId, req.user.id),
      eq(usersToRooms.roomId, roomId)
    ),
  });

  if (!isMember)
    throw new ResponseError(403, "You are not a member of this room");

  const results = await db.query.messages.findMany({
    where: eq(messages.roomId, roomId),
    orderBy: [asc(messages.sentAt)],
    with: {
      sender: {
        columns: {
          username: true,
          id: true,
        },
      },
      room: {
        columns: {
          name: true,
          id: true,
        },
      },
    },
    columns: {
      id: true,
      messageText: true,
      sentAt: true,
    },
  });

  return results;
}
