// db/schema.ts
import { pgTable, serial, text, integer, bigint, primaryKey, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Keep existing books table (remove genres field)
export const books = pgTable('book', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  pages: integer('pages').notNull(),
  isbn13: bigint('isbn13', { mode: 'number' }).notNull(),
})

// NEW: Genre table
export const genre = pgTable('genre', {
  id: serial('id').primaryKey(),
  value: text('value').notNull().unique(),
})

// NEW: Book-Genre join table
export const bookGenre = pgTable(
  'book_genre',
  {
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    genreId: integer('genre_id')
      .notNull()
      .references(() => genre.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bookId, table.genreId] }),
    bookIdIdx: index('book_genre_book_id_idx').on(table.bookId),
    genreIdIdx: index('book_genre_genre_id_idx').on(table.genreId),
  }),
)

// Relations
export const booksRelations = relations(books, ({ many }) => ({
  genres: many(bookGenre),
}))

export const genreRelations = relations(genre, ({ many }) => ({
  books: many(bookGenre),
}))

export const bookGenreRelations = relations(bookGenre, ({ one }) => ({
  book: one(books, {
    fields: [bookGenre.bookId],
    references: [books.id],
  }),
  genre: one(genre, {
    fields: [bookGenre.genreId],
    references: [genre.id],
  }),
}))
