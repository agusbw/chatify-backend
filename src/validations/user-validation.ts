import { z } from "zod";

export const register = z
  .object({
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters"),
    username: z
      .string({
        required_error: "Username is required",
      })
      .min(2, "Username must be at least 2 characters"),
    confirmPassword: z
      .string({
        required_error: "Confirm password is required",
      })
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const login = z.object({
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(1, "Password is required"),
  username: z
    .string({
      required_error: "Username is required",
    })
    .min(1, "Username is required"),
});
