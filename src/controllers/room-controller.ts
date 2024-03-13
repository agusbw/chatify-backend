import * as roomService from "../services/room-service";
import { Request, Response, NextFunction } from "express";

export async function createRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const newRoom = await roomService.create(req);
    res.status(201).json(newRoom);
  } catch (err) {
    next(err);
  }
}

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
