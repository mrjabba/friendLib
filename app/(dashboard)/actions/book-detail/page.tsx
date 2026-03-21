import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { books, genre, bookGenre } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import Button from '@/components/Button'
import Image from 'next/image'
import GenrePill from '@/components/GenrePill'

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`)
const db = drizzle(client)

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function BookDetailPage({ searchParams }: PageProps) {
  const params = await searchParams
  const id = parseInt(params.id || '0', 10)

  const result = await db.select().from(books).where(eq(books.id, id)).limit(1)

  if (result.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Book Not Found</h2>
        <Link href="/actions/book-add" className="text-blue-600 hover:underline">
          Add a new book
        </Link>
      </div>
    )
  }

  const book = result[0]

  const genres = await db
    .select({ id: genre.id, value: genre.value })
    .from(bookGenre)
    .innerJoin(genre, eq(bookGenre.genreId, genre.id))
    .where(eq(bookGenre.bookId, id))

  const isbnFormatted = book.isbn13
    .toString()
    .replace(/(\d{3})(\d{1})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4-$5')

  return (
    <div>
      <div className="flex gap-4">
        <Image src="/images/book-empty-small.png" alt="logo-small" width={200} height={200} />
        <div className="book-details"></div>

        <div>
          <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
          <p className="text-gray-600 mb-6">{book.author}</p>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">ISBN:</span>
                <span className="text-sm">{isbnFormatted}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Pages:</span>
                <span className="text-sm">{book.pages}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        {genres.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((g: { id: number; value: string }) => (
                <GenrePill key={g.id} id={g.id} value={g.value} />
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-4">
          <Link href="/actions/book-add">
            <Button>Add Another Book</Button>
          </Link>
          <Link href={`/actions/book-edit?id=${book.id}`}>
            <Button>Edit</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
