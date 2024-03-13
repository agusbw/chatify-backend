import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { loadMessagesFromFile, saveMessagesToFile } from "./message-handler";
import cors from "cors";
import { Message } from "./utils/types";
import publicRoute from "./routes/public-routes";
import errorMiddleware from "./middleware/error-middleware";
import configurePassport from "./utils/passport-config";
import passport from "passport";
import protectedRoute from "./routes/protected-routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

configurePassport();
app.use(passport.initialize());

app.use(publicRoute);
app.use(protectedRoute);
app.use(errorMiddleware);

const server = createServer(app);
const port = process.env.PORT;

let messages: Message[] = loadMessagesFromFile();

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  io.emit("message-sent", messages);

  socket.on("message-sent", (data: Message) => {
    messages.push(data);
    saveMessagesToFile(messages);
    io.emit("message-sent", messages);
  });
});

// start the Express server and socket.io server
server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port} 🚀`);
});
