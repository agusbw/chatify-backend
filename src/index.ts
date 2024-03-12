import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { loadMessagesFromFile, saveMessagesToFile } from "./message-handler";
import { Message } from "./utils/types";
import { db } from "./db";

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT;

let messages: Message[] = loadMessagesFromFile();

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", async (req, res) => {
  const data = await db.query.users.findMany();
  res.json(data);
});

app.post("/register", (req, res) => {});

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
