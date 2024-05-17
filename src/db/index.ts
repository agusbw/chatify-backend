import "dotenv/config";
import pg from "pg";
import * as schema from "./schema.js";
import { drizzle } from "drizzle-orm/node-postgres";

export const connection = new pg.Client({
  connectionString: process.env.DB_URL,
});

await connection.connect();

export const db = drizzle(connection, { schema });
