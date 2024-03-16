import { db } from "../db";
import { messages, usersToRooms } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import * as messageValidation from "../validations/message-validation";
import { Request } from "express";
import ResponseError from "../utils/response-error";

export async function get(req: Request) {
  const roomId = messageValidation.roomIdSchema.parse(req.params.roomId);

  const isMember = await db.query.usersToRooms.findFirst({
    where: eq(usersToRooms.userId, req.user.id),
  });

  if (!isMember) {
    throw new ResponseError(403, "You are not a member of this room");
  }

  const results = await db.query.messages.findMany({
    where: eq(messages.roomId, roomId),
    orderBy: [asc(messages.sentAt)],
    with: {
      sender: {
        columns: {
          username: true,
        },
      },
      room: {
        columns: {
          name: true,
        },
      },
    },
  });

  return results;
}
