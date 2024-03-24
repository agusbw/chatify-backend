import { users } from "../db/schema";

export type User = typeof users.$inferSelect;

export type IncommingMessage = {
  id: number;
  messageText: string;
  roomId: number;
  room: {
    name: string;
  };
  sender: {
    username: string;
  };
  senderId: number;
  sentAt: Date;
  connectionId?: string;
};

export interface ServerToClientEvents {
  incomingMessage: (message: IncommingMessage) => void;
  messageNotSent: (error: { error: string; messageId: number }) => void;
}

export interface ClientToServerEvents {
  messageSent: (message: IncommingMessage) => void;
}

export type JwtPayload = {
  id: number;
  username: string;
};
