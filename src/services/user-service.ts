import { db } from "../db";
import { users } from "../db/schema";
import { hash, compare } from "bcrypt";
import { eq } from "drizzle-orm";
import * as userValidation from "../validations/user-validation";
import validate from "../validations";
import { Request } from "express";
import ResponseError from "../utils/response-error";
import { JwtPayload } from "../utils/types";
import jwt from "jsonwebtoken";

async function register(req: Request) {
  // validate the user data
  const userData = validate(userValidation.register, req, "body");

  // check if the username already exists
  const user = await db.query.users.findFirst({
    where: eq(users.username, userData.username),
  });

  if (user) {
    throw new ResponseError(400, "Username already exists");
  }

  const data = await db
    .insert(users)
    .values({
      username: userData.username,
      password: await hash(userData.password, 10),
    })
    .returning({
      username: users.username,
      id: users.id,
    });

  return data;
}

async function login(req: Request) {
  const { username, password } = validate(userValidation.login, req, "body");

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    throw new ResponseError(400, "Username or password is incorrect");
  }

  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    throw new ResponseError(400, "Username or password is incorrect");
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    } as JwtPayload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: "6h",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  };
}

export { register, login };
