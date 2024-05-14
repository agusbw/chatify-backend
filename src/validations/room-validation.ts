import { z } from "zod";

export const create = z.object({
  name: z
    .string({
      required_error: "Chat room name is required.",
    })
    .trim()
    .min(1, "Chat room name is required."),
});

export const join = z.object({
  code: z
    .string({
      required_error: "Room code is required.",
    })
    .min(1, "Room code is required."),
});

export const roomIdParams = z.object({ roomId: z.coerce.number() });

export const kickMemberParams = z.object({
  roomId: z.coerce.number(),
  memberId: z.coerce.number(),
});
