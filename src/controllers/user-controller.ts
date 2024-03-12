import * as userService from "../services/user-service";
import { NextFunction, Request, Response } from "express";

async function registerUser(req: Request, res: Response, next: NextFunction) {
  console.log(req.body);
  try {
    const newUser = await userService.register(req);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
}

export { registerUser };
