// db/schema.ts
import { pgTable, serial, text, integer, bigint } from "drizzle-orm/pg-core";

export const books = pgTable("book", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  pages: integer("pages").notNull(),
  genres: text("genres").notNull(), // store as comma-separated or JSON string
  isbn13: bigint("isbn13", { mode: "number" }).notNull(),
});
