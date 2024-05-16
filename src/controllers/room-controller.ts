import * as roomService from "../services/room-service";
import { Request, Response, NextFunction } from "express";

export async function getUserJoinedRooms(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rooms = await roomService.getUserJoinedRooms(req);
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

export async function refreshCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const newCode = await roomService.refreshCode(req);
    res.json(newCode);
  } catch (err) {
    next(err);
  }
}

export async function getRoomById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const room = await roomService.getRoomById(req);
    res.json(room);
  } catch (err) {
    next(err);
  }
}
