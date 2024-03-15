import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 256 }).unique(),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).unique(),
  code: varchar("code", { length: 256 }).unique(),
  creatorId: integer("creator_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  messageText: text("message_text"),
  sentAt: timestamp("sent_at").defaultNow(),
  roomId: integer("room_id").references(() => rooms.id, {
    onDelete: "cascade",
  }),
  senderId: integer("sender_id").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const usersToRooms = pgTable(
  "users_to_rooms",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    roomId: integer("room_id")
      .notNull()
      .references(() => rooms.id, {
        onDelete: "cascade",
      }),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.roomId] }),
    };
  }
);

export const usersRelations = relations(users, ({ many }) => ({
  rooms: many(rooms),
  messages: many(messages),
  usersToRooms: many(usersToRooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [rooms.creatorId],
    references: [users.id],
  }),
  messages: many(messages),
  usersToRooms: many(usersToRooms),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
  }),
}));

export const usersToRoomsRelations = relations(usersToRooms, ({ one }) => ({
  room: one(rooms, {
    fields: [usersToRooms.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [usersToRooms.userId],
    references: [users.id],
  }),
}));
