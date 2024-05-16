import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import cors from "cors";
import publicRoute from "./routes/public-routes";
import errorMiddleware from "./middleware/error-middleware";
import configurePassport from "./utils/passport-config";
import passport from "passport";
import protectedRoute from "./routes/protected-routes";
import type { ServerToClientEvents, ClientToServerEvents } from "./utils/types";
import initializeSocket from "./sockets";

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
