import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptionsWithRequest,
} from "passport-jwt";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

export default function configurePassport() {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET as string,
      },
      async (jwt_payload, done) => {
        try {
          const user = await db.query.users.findFirst({
            where: eq(users.username, jwt_payload.username),
            columns: {
              id: true,
              username: true,
            },
          });

          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
}
