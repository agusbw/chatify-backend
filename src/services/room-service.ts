import { Request } from "express";
import validate from "../validations";
import * as roomValidation from "../validations/room-validation";
import { db } from "../db";
import { and, eq, ne } from "drizzle-orm";
import { generateUniqueCode } from "../utils";
import { rooms, usersToRooms } from "../db/schema";
import ResponseError from "../utils/response-error";

export async function create(req: Request) {
  const { name } = validate(roomValidation.create, req, "body");

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.name, name),
  });

  if (room) {
    throw new ResponseError(400, "Room name is already used");
  }

  const result = await db.transaction(async (tx) => {
    const insert = await tx
      .insert(rooms)
      .values({
        name: name,
        createdAt: new Date(),
        creatorId: req.user.id,
        code: generateUniqueCode(),
      })
      .returning();

    await tx.insert(usersToRooms).values({
      userId: req.user.id,
      roomId: insert[0].id,
    });

    return insert[0];
  });

  return result;
}

export async function deleteRoom(req: Request) {
  const { roomId } = validate(roomValidation.roomIdParams, req, "params");

  // only room creator can delete the rooms
  const room = await db.query.rooms.findFirst({
    where: and(eq(rooms.id, roomId), eq(rooms.creatorId, req.user.id)),
  });
  if (!room) {
    throw new ResponseError(
      400,
      "Room doesn't exist or you're not the creator"
    );
  }

  const deletedRoom = await db
    .delete(rooms)
    .where(eq(rooms.id, roomId))
    .returning({
      name: rooms.name,
      roomId: rooms.id,
    });

  return deletedRoom[0];
}

export async function getUserJoinedRooms(req: Request) {
  const results = await db.query.usersToRooms.findMany({
    where: eq(usersToRooms.userId, req.user.id),
    columns: {},
    with: {
      room: true,
    },
    orderBy: (posts, { desc }) => [desc(posts.joinedAt)],
  });
  return results.map((result) => result.room);
}

export async function getRoomById(req: Request) {
  const { roomId } = validate(roomValidation.roomIdParams, req, "params");
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      usersToRooms: {
        columns: {},
        with: {
          user: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  return room;
}

export async function refreshCode(req: Request) {
  const { roomId } = validate(roomValidation.roomIdParams, req, "params");
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

export async function joinRoom(req: Request) {
  const { code } = validate(roomValidation.join, req, "body");

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.code, code),
  });

  if (!room) {
    throw new ResponseError(404, "Room not found");
  }

  const userToRoom = await db
    .select()
    .from(usersToRooms)
    .where(
      and(
        eq(usersToRooms.userId, req.user.id),
        eq(usersToRooms.roomId, room.id)
      )
    );

  if (userToRoom.length > 0) {
    throw new ResponseError(400, "You are already in this room");
  }

  await db
    .insert(usersToRooms)
    .values({
      userId: req.user.id,
      roomId: room.id,
    })
    .returning();

  return {
    message: "Room joined successfully",
    room: room,
  };
}

export async function kickMember(req: Request) {
  const { memberId, roomId } = validate(
    roomValidation.kickMemberParams,
    req,
    "params"
  );

  if (memberId === req.user.id) {
    throw new ResponseError(
      400,
      "Use `leave room` endpoint to kick yourself :)"
    );
  }

  // only room creator can kick member
  const isCreator = await db.query.rooms.findFirst({
    where: and(eq(rooms.id, roomId), eq(rooms.creatorId, req.user.id)),
  });

  if (!isCreator) {
    throw new ResponseError(
      400,
      "Room doesn't exist or you're not the room creator!"
    );
  }

  const kicked = await db
    .delete(usersToRooms)
    .where(
      and(eq(usersToRooms.userId, memberId), eq(usersToRooms.roomId, roomId))
    )
    .returning({
      kickedMemberId: usersToRooms.userId,
    });

  if (kicked.length <= 0) {
    throw new ResponseError(400, "Member doesn't exist in the room!");
  }

  return {
    message: "Kick member succesfully!",
    memberId: kicked[0].kickedMemberId,
  };
}

export async function leaveRoom(req: Request) {
  const { roomId } = validate(roomValidation.roomIdParams, req, "params");

  const userToRoom = await db.query.usersToRooms.findFirst({
    where: and(
      eq(usersToRooms.roomId, roomId),
      eq(usersToRooms.userId, req.user.id)
    ),
  });

  if (!userToRoom) {
    throw new ResponseError(400, "You're not the room member!");
  }

  await db.transaction(async (tx) => {
    // check if he is the only one in the group
    const anyOtherMember = await tx.query.usersToRooms.findFirst({
      where: and(
        eq(usersToRooms.roomId, roomId),
        ne(usersToRooms.userId, req.user.id)
      ),
    });

    if (!anyOtherMember) {
      await tx.delete(rooms).where(eq(rooms.id, roomId));
    } else {
      // check if he is the creator
      const creator = await tx.query.rooms.findFirst({
        where: and(eq(rooms.creatorId, req.user.id), eq(rooms.id, roomId)),
      });

      if (!creator) {
        await tx
          .delete(usersToRooms)
          .where(
            and(
              eq(usersToRooms.roomId, roomId),
              eq(usersToRooms.userId, req.user.id)
            )
          )
          .returning();
      } else {
        await tx
          .update(rooms)
          .set({
            creatorId: anyOtherMember.userId,
          })
          .where(eq(rooms.id, roomId));
        await tx
          .delete(usersToRooms)
          .where(
            and(
              eq(usersToRooms.roomId, roomId),
              eq(usersToRooms.userId, req.user.id)
            )
          )
          .returning();
      }
    }
  });

  return {
    message: "Leave group successfully!",
  };
}
