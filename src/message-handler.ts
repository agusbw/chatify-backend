import fs from "fs";
import { Message } from "./utils/types";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const messagesFilePath = path.join(__dirname, "..", "data", "messages.json");

function loadMessagesFromFile(): Message[] {
  try {
    const data = fs.readFileSync(messagesFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading messages from file:", error);
    return [];
  }
}

function saveMessagesToFile(messages: Message[]) {
  try {
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error("Error saving messages to file:", error);
  }
}

export { loadMessagesFromFile, saveMessagesToFile };
