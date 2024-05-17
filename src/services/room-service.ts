import { type Request } from "express";
import validate from "../validations/index.js";
import * as roomValidation from "../validations/room-validation.js";
import { db } from "../db/index.js";
import { and, eq } from "drizzle-orm";
import { generateUniqueCode } from "../utils/index.js";
import { rooms, usersToRooms } from "../db/schema.js";
import ResponseError from "../utils/response-error.js";

export async function getUserJoinedRooms(req: Request) {
  const results = await db.query.usersToRooms.findMany({
    where: eq(usersToRooms.userId, req.user.id),
    columns: {},
    with: {
      room: true,
    },
    orderBy: (usersToRooms, { desc }) => [desc(usersToRooms.joinedAt)],
  });
  return results.map((result) => result.room);
}

export async function getRoomById(req: Request) {
  const { roomId } = validate(roomValidation.roomId, req, "params");
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      usersToRooms: {
        columns: {
          joinedAt: true,
        },
        with: {
          user: {
            columns: {
              id: true,
              username: true,
            },
          },
          room: {
            columns: {
              creatorId: true,
              name: true,
              id: true,
            },
          },
        },
      },
    },
  });

  return room;
}

export async function refreshCode(req: Request) {
  const { roomId } = validate(roomValidation.roomId, req, "params");
  // only room creator can refresh the code
  const room = await db.query.rooms.findFirst({
    where: and(eq(rooms.id, roomId), eq(rooms.creatorId, req.user.id)),
  });

  if (!room) {
    throw new ResponseError(
      400,
      "Room doesn't exist or you're not the creator"
    );
  }

  const updatedRoomCode = await db
    .update(rooms)
    .set({
      code: generateUniqueCode(),
    })
    .where(eq(rooms.id, roomId))
    .returning({
      code: rooms.code,
    });

  return updatedRoomCode[0];
}
