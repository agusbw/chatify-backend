import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import cors from "cors";
import publicRoute from "./routes/public-routes.js";
import errorMiddleware from "./middleware/error-middleware.js";
import configurePassport from "./utils/passport-config.js";
import passport from "passport";
import protectedRoute from "./routes/protected-routes.js";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "./utils/types.js";
import initializeSocket from "./sockets/index.js";

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

configurePassport();
app.use(passport.initialize());
app.use(publicRoute);
app.use(protectedRoute);
app.use(errorMiddleware);

initializeSocket(io);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port} 🚀`);
});
