import { Request } from "express";
import validate from "../validations";
import * as roomValidation from "../validations/room-validation";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { generateUniqueCode } from "../utils";
import { rooms, usersToRooms } from "../db/schema";
import ResponseError from "../utils/response-error";

type NewRoom = typeof rooms.$inferInsert;

export async function create(req: Request) {
  const { name } = validate(roomValidation.create, req);

  // check if the name exist
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.name, name),
  });

  if (room) {
    throw new ResponseError(400, "Room name is already used");
  }

  const newRoom: NewRoom = {
    name: name,
    createdAt: new Date(),
    creatorId: req.user.id,
    code: generateUniqueCode(),
  };

  const insert = await db.insert(rooms).values(newRoom).returning();

  const newUsersToRooms = {
    userId: req.user.id,
    roomId: insert[0].id,
  };

  await db.insert(usersToRooms).values(newUsersToRooms).returning();

  return insert[0];
}

export async function getUserJoinedRooms(req: Request) {
  const rooms = await db.query.usersToRooms.findMany({
    where: eq(usersToRooms.userId, req.user.id),
    with: {
      room: true,
    },
  });
  const data = rooms.map((room) => room.room);

  return data;
}
