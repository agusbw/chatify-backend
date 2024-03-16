import { z } from "zod";

export const roomIdSchema = z.string().regex(/^\d+$/).transform(Number);
