import { users } from "../db/schema";
import { z } from "zod";
import { incomingMessageSchema } from "../validations/message-validation";

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

export type IncomingMessageSchema = z.infer<typeof incomingMessageSchema>;

export interface ServerToClientEvents {
  successSendMessage: (message: SuccessSendMessage) => void;
  errorSendMessage: (error: { error: string; messageId: string }) => void;
}

export interface ClientToServerEvents {
  sendMessage: (message: Omit<IncomingMessageSchema, "sentAt">) => void;
}

export type JwtPayload = {
  id: number;
  username: string;
};
