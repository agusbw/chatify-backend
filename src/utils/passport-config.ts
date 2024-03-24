import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

export default function configurePassport() {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.username, jwt_payload.username),
        });

        if (user) {
          return done(null, {
            username: user.username,
            id: user.id,
          });
        } else {
          return done(null, false);
          // or you could create a new account
        }
      } catch (err) {
        return done(err, false);
      }
    })
  );
}
