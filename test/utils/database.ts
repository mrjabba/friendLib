import { eq } from 'drizzle-orm'
import { books, genre, bookGenre } from '@/db/schema'

export const testDbUtils = {
  async clean(db: any) {
    await db.delete(bookGenre).execute()
    await db.delete(books).execute()
    await db.delete(genre).execute()
  },

  async createBook(
    db: any,
    data: { title: string; author: string; pages: number; isbn13: number; userId: string },
  ) {
    const result = await db.insert(books).values(data).returning()
    return result[0]
  },

  async createGenre(db: any, value: string) {
    const result = await db.insert(genre).values({ value }).returning()
    return result[0]
  },

  async linkBookToGenre(db: any, bookId: number, genreId: number) {
    await db.insert(bookGenre).values({ bookId, genreId })
  },

  async getBookById(db: any, id: number) {
    const result = await db.select().from(books).where(eq(books.id, id)).limit(1)
    return result[0] || null
  },

  async getGenreById(db: any, id: number) {
    const result = await db.select().from(genre).where(eq(genre.id, id)).limit(1)
    return result[0] || null
  },

  async getBooksByUser(db: any, userId: string) {
    return await db.select().from(books).where(eq(books.userId, userId))
  },

  async getGenresForBook(db: any, bookId: number) {
    return await db
      .select({ id: genre.id, value: genre.value })
      .from(bookGenre)
      .innerJoin(genre, eq(bookGenre.genreId, genre.id))
      .where(eq(bookGenre.bookId, bookId))
  },
}
