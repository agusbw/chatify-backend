import * as messageService from "../services/message-service";
import { Request, Response, NextFunction } from "express";

export async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const messages = await messageService.get(req);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}
