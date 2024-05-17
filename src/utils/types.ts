import { users } from "../db/schema.js";
import { z } from "zod";
import * as messageValidation from "../validations/message-validation.js";
import * as roomValidation from "../validations/room-validation.js";
import { Socket, Server } from "socket.io";

export type User = typeof users.$inferSelect;

export type SuccessSendMessage = {
  id: string;
  messageText: string;
  sentAt: Date;
  sender: {
    id: number;
    username: string;
  };
  room: {
    id: number;
    name: string;
  };
};

export type IncomingMessage = z.infer<typeof messageValidation.incomingMessage>;
export type KickMember = z.infer<typeof roomValidation.kickMember>;
export type CreateRoom = z.infer<typeof roomValidation.create>;
export type JoinRoom = z.infer<typeof roomValidation.join>;
export type RoomId = z.infer<typeof roomValidation.roomId>;
export type SocketResponseError = { error: string };
export type SuccessDeleteRoom = { deletedBy: number; deletedRoom: number };
export type SuccessCreateRoom = { roomId: number };

export interface SocketHandler<T> {
  socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  userId: number;
  req: T;
  io: Server<ClientToServerEvents, ServerToClientEvents>;
}

export interface ServerToClientEvents {
  successSendMessage: (message: SuccessSendMessage) => void;
  errorSendMessage: (
    data: SocketResponseError & {
      messageId: string;
    }
  ) => void;
  memberKicked: (data: KickMember) => void;
  errorKickMember: (data: SocketResponseError) => void;
  successCreateRoom: (data: SuccessCreateRoom) => void;
  errorCreateRoom: (data: SocketResponseError) => void;
  successJoinRoom: () => void;
  errorJoinRoom: (data: SocketResponseError) => void;
  successDeleteRoom: (data: SuccessDeleteRoom) => void;
  errorDeleteRoom: (data: SocketResponseError) => void;
  successLeaveRoom: () => void;
  errorLeaveRoom: (data: SocketResponseError) => void;
}

export interface ClientToServerEvents {
  sendMessage: (message: Omit<IncomingMessage, "sentAt">) => void;
  kickMember: (req: KickMember) => void;
  joinRoom: (req: JoinRoom) => void;
  leaveRoom: (req: RoomId) => void;
  deleteRoom: (req: RoomId) => void;
  createRoom: (req: CreateRoom) => void;
}

export type JwtPayload = {
  id: number;
  username: string;
};
