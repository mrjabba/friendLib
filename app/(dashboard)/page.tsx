import { getGenrePopularity } from './actions/genre/actions'
import Link from 'next/link'

export default async function DashboardPage() {
  const genres = await getGenrePopularity()

  return (
    <>
      <div className="flex items-start gap-12">
        <div>
          <img src="/images/logo-small.png" alt="logo-small" className="w-80 h-auto" />
          <h2 className="text-stone-700 text-lg mt-4">
            Search, borrow and loan books with friends.
          </h2>
        </div>

        <div className="flex-1 max-w-md">
          <h3 className="text-xl font-semibold mb-4">Genre Popularity</h3>
          {genres.length > 0 ? (
            <ul className="space-y-1">
              {genres.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/actions/genre/${g.id}`}
                    className="flex justify-between items-center px-3 py-2 rounded hover:bg-slate-100 transition"
                  >
                    <span className="text-blue-600 hover:underline">{g.value}</span>
                    <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-full">
                      {g.count} {g.count === 1 ? 'book' : 'books'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No genres found.</p>
          )}
        </div>
      </div>
    </>
  )
}
