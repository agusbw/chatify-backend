import * as messageService from "../services/message-service";
import { Request, Response, NextFunction } from "express";

export async function getMessagesByRoomId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const messages = await messageService.getMessagesByRoomId(req);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}
