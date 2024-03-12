import * as userService from "../services/user-service";
import { NextFunction, Request, Response } from "express";

async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const newUser = await userService.register(req);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
}

async function loginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.login(req);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export { registerUser, loginUser };
