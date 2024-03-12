import { Request } from "express";
import validate from "../validations";
import * as roomValidation from "../validations/room-validation";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { generateUniqueCode } from "../utils";
import { rooms } from "../db/schema";
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

  return await db
    .insert(rooms)
    .values(newRoom)
    .onConflictDoNothing()
    .returning();
}
