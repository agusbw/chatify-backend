import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { users } from "../db/schema";

type User = typeof users.$inferSelect;

// Define a middleware function to populate req.user
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", { session: false }, (err: Error, user: User) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // No user found, you can handle this case as needed
      return res.status(401).json({ message: "Unauthorized" });
    }
    // User authenticated, set it in req.user
    req.user = {
      id: user.id,
      username: user.username,
    };

    next();
  })(req, res, next);
};
