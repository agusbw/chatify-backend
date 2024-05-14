import { z } from "zod";

export const roomIdParams = z.object({ roomId: z.coerce.number() });

export const incomingMessage = z.object({
  messageText: z.string().trim().min(1),
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
