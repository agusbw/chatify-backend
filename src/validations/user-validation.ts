import { z } from "zod";

export const register = z
  .object({
    password: z.string().min(6),
    username: z.string().min(2),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const login = z.object({
  password: z.string().min(1),
  username: z.string().min(1),
});
