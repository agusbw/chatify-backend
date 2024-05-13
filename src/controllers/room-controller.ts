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

export async function deleteRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedRoom = await roomService.deleteRoom(req);
    res.json(deletedRoom);
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

export async function joinRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const room = await roomService.joinRoom(req);
    res.json(room);
  } catch (err) {
    next(err);
  }
}

export async function kickMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await roomService.kickMember(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function leaveRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await roomService.leaveRoom(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
