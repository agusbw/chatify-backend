import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import ResponseError from "../utils/response-error.js";
import { DrizzleError } from "drizzle-orm";

function errorMiddleware(
  err: ResponseError | ZodError | Error | null,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!err) {
    return next();
  }

  if (err instanceof ResponseError) {
    return res.status(err.status).json({ error: err.message }).end();
  }

  if (err instanceof ZodError) {
    const errMessage = err.errors.map((error) => error.message).join(",");
    return res.status(400).json({ error: errMessage }).end();
  }

  if (err instanceof DrizzleError) {
    return res.status(400).json({ error: err.message }).end();
  }

  // Log the error for debugging unhandled error
  console.error("Unhandled error:", err);

  return res
    .status(500)
    .json({
      errors: "Internal server error",
    })
    .end();
}

export default errorMiddleware;
