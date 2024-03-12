import { db } from "../db";
import { users } from "../db/schema";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import * as userValidation from "../validations/user-validation";
import validate from "../validations";
import { Request } from "express";
import ResponseError from "../utils/response-error";

async function register(req: Request) {
  // validate the user data
  const userData = validate(userValidation.register, req);

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

export { register };
