import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { loadMessagesFromFile, saveMessagesToFile } from "./message-handler";
import { Message } from "./utils/types";
import publicRoute from "./routes/public/public-routes";
import errorMiddleware from "./middleware/error-middleware";

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT;

app.use(express.json());
app.use(publicRoute);
app.use(errorMiddleware);

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
