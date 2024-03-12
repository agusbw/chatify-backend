import { z } from "zod";

export const create = z.object({
  name: z.string().min(1),
});
