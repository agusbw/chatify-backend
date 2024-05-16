import { db } from "../../db";
import { kickMember } from "../../validations/room-validation";
import { usersToRooms, rooms } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import type { KickMember, SocketHandler } from "../../utils/types";

export async function handleKickMember({
  socket,
  io,
  userId,
  req,
}: SocketHandler<KickMember>) {
  try {
    const validatedReq = kickMember.parse(req);

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, validatedReq.roomId),
    });

    if (!room) {
      throw new Error("Room not available!");
    }

    if (room.creatorId !== userId) {
      throw new Error("Only the room creator can kick members!");
    }

    await db
      .delete(usersToRooms)
      .where(
        and(
          eq(usersToRooms.roomId, validatedReq.roomId),
          eq(usersToRooms.userId, validatedReq.memberId)
        )
      );

    const memberSockets = Array.from(io.sockets.sockets.values()).filter(
      (sock) => sock.handshake.query.userId === String(validatedReq.memberId)
    );

    // Notify kicked member and make them leave the room
    memberSockets.forEach((memberSocket) => {
      memberSocket.leave(String(validatedReq.roomId));
      console.log(`Emitting memberKicked to userId: ${validatedReq.memberId}`);
      memberSocket.emit("memberKicked", {
        roomId: validatedReq.roomId,
        memberId: validatedReq.memberId,
      });
    });

    // Notify the kicker
    socket.emit("memberKicked", {
      roomId: validatedReq.roomId,
      memberId: validatedReq.memberId,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error kicking user:", error.message);
    }
    socket.emit("errorKickMember", {
      error: "Failed to kick member",
    });
  }
}
