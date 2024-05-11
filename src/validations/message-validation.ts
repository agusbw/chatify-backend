import { z } from "zod";

export const roomIdSchema = z.string().regex(/^\d+$/).transform(Number);

export const incomingMessageSchema = z.object({
  messageText: z.string().min(1),
  room: z.object({
    id: z.number(),
    name: z.string(),
  }),
  sender: z.object({
    id: z.number(),
    username: z.string(),
  }),
  id: z.string(),
  sentAt: z.coerce.date(),
});
