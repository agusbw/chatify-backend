import { rooms, usersToRooms } from "../../db/schema";
import { generateUniqueCode } from "../../utils";
import type {
  CreateRoom,
  JoinRoom,
  RoomId,
  SocketHandler,
} from "../../utils/types";
import { db } from "../../db";
import { ilike, eq, and, ne } from "drizzle-orm";
import * as roomValidation from "../../validations/room-validation";

export async function handleCreateRoom({
  socket,
  io,
  userId,
  req,
}: SocketHandler<CreateRoom>) {
  try {
    const { name } = roomValidation.create.parse(req);
    const room = await db.query.rooms.findFirst({
      where: ilike(rooms.name, name.toLowerCase()),
    });

    if (room) {
      throw new Error("Room name is already used");
    }

    const result = await db.transaction(async (tx) => {
      const insert = await tx
        .insert(rooms)
        .values({
          name: name,
          createdAt: new Date(),
          creatorId: userId,
          code: generateUniqueCode(),
        })
        .returning();

      await tx.insert(usersToRooms).values({
        userId,
        roomId: insert[0].id,
      });

      return insert[0];
    });
    socket.join(String(result.id));
    socket.emit("successCreateRoom", {
      roomId: result.id,
    });
  } catch (error) {
    let message: string | undefined;
    if (error instanceof Error) {
      error = error.message;
    }
    socket.emit("errorCreateRoom", {
      error: message ? message : "Failed to create the room!",
    });
    console.log(error);
  }
}

export async function handleJoinRoom({
  socket,
  io,
  userId,
  req,
}: SocketHandler<JoinRoom>) {
  try {
    const { code } = roomValidation.join.parse(req);

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.code, code),
    });

    if (!room) {
      throw new Error("Room code is invalid!");
    }

    const userToRoom = await db
      .select()
      .from(usersToRooms)
      .where(
        and(eq(usersToRooms.userId, userId), eq(usersToRooms.roomId, room.id))
      );

    if (userToRoom.length > 0) {
      throw new Error("You are already in joined the room");
    }

    const result = await db
      .insert(usersToRooms)
      .values({
        userId: userId,
        roomId: room.id,
      })
      .returning();

    socket.join(String(result[0].roomId));
    socket.emit("successJoinRoom");
  } catch (error) {
    let message: string | undefined;
    if (error instanceof Error) {
      error = error.message;
    }
    socket.emit("errorJoinRoom", {
      error: message ? message : "Failed to join the room!",
    });
    console.log(error);
  }
}

export async function handleLeaveRoom({
  socket,
  io,
  userId,
  req,
}: SocketHandler<RoomId>) {
  try {
    const { roomId } = roomValidation.roomId.parse(req);
    const userToRoom = await db.query.usersToRooms.findFirst({
      where: and(
        eq(usersToRooms.roomId, roomId),
        eq(usersToRooms.userId, userId)
      ),
    });

    if (!userToRoom) {
      throw new Error("You're not the room member!");
    }

    await db.transaction(async (tx) => {
      // check if he is the only one in the group
      const anyOtherMember = await tx.query.usersToRooms.findFirst({
        where: and(
          eq(usersToRooms.roomId, roomId),
          ne(usersToRooms.userId, userId)
        ),
      });

      if (!anyOtherMember) {
        await tx.delete(rooms).where(eq(rooms.id, roomId));
      } else {
        // check if he is the creator
        const creator = await tx.query.rooms.findFirst({
          where: and(eq(rooms.creatorId, userId), eq(rooms.id, roomId)),
        });

        if (!creator) {
          await tx
            .delete(usersToRooms)
            .where(
              and(
                eq(usersToRooms.roomId, roomId),
                eq(usersToRooms.userId, userId)
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
                eq(usersToRooms.userId, userId)
              )
            )
            .returning();
        }
      }
    });
    socket.emit("successLeaveRoom");
    socket.leave(String(roomId));
  } catch (error) {
    let message: string | undefined;
    if (error instanceof Error) {
      error = error.message;
    }
    socket.emit("errorLeaveRoom", {
      error: message ? message : "Failed to leave the room!",
    });
    console.log(error);
  }
}

export async function handleDeleteRoom({
  socket,
  io,
  userId,
  req,
}: SocketHandler<RoomId>) {
  try {
    const { roomId } = roomValidation.roomId.parse(req);

    // only room creator can delete the rooms
    const room = await db.query.rooms.findFirst({
      where: and(eq(rooms.id, roomId), eq(rooms.creatorId, userId)),
    });

    if (!room) {
      throw new Error("Room doesn't exist or you're not the creator");
    }

    await db.delete(rooms).where(eq(rooms.id, roomId)).returning({
      name: rooms.name,
      roomId: rooms.id,
    });

    io.to(String(roomId)).emit("successDeleteRoom", {
      deletedBy: userId,
      deletedRoom: roomId,
    });

    // Get all sockets in the room
    const socketsInRoom = io.sockets.adapter.rooms.get(String(roomId));

    if (socketsInRoom) {
      // Make each socket leave the room
      for (const socketId of socketsInRoom) {
        const socketToLeave = io.sockets.sockets.get(socketId);
        if (socketToLeave) {
          socketToLeave.leave(String(roomId));
        }
      }
    }
  } catch (error) {
    let message: string | undefined;
    if (error instanceof Error) {
      error = error.message;
    }
    socket.emit("errorDeleteRoom", {
      error: message ? message : "Failed to delete the room!",
    });
    console.log(error);
  }
}
