// db/schema.ts
import {
  pgTable,
  serial,
  text,
  integer,
  bigint,
  primaryKey,
  index,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Books table with user_id for ownership (Clerk userId is a string)
export const books = pgTable('book', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  pages: integer('pages').notNull(),
  isbn13: bigint('isbn13', { mode: 'number' }).notNull(),
  userId: text('user_id').notNull(),
})

// Genre table
export const genre = pgTable('genre', {
  id: serial('id').primaryKey(),
  value: text('value').notNull().unique(),
})

// Book-Genre join table
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
  borrows: many(borrows),
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

export const borrows = pgTable('borrow', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookId: integer('book_id')
    .notNull()
    .references(() => books.id, { onDelete: 'cascade' }),
  ownerId: text('owner_id').notNull(),
  borrowerId: text('borrower_id').notNull(),
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  returnedAt: timestamp('returned_at', { withTimezone: true }),
  ownerConfirmedReturnAt: timestamp('owner_confirmed_return_at', { withTimezone: true }),
})

export const borrowsRelations = relations(borrows, ({ one }) => ({
  book: one(books, {
    fields: [borrows.bookId],
    references: [books.id],
  }),
}))
