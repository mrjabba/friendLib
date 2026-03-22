'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const [genres, setGenres] = useState<any[]>([])

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/genres/popularity')
        .then((res) => res.json())
        .then((data) => setGenres(data))
        .catch(() => setGenres([]))
    }
  }, [isSignedIn])

  if (!isLoaded) {
    return <p>Loading...</p>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <>
      <div className="flex items-start gap-12">
        <div>
          <img src="/images/logo-small.png" alt="logo-small" className="w-80 h-auto" />
          <h2 className="text-stone-700 text-lg mt-4">
            Search, borrow and loan books with friends.
          </h2>
          {user?.emailAddresses[0]?.emailAddress && (
            <p className="text-stone-500 text-sm mt-2">
              Logged in as: {user.emailAddresses[0].emailAddress}
            </p>
          )}
        </div>

        <div className="flex-1 max-w-md">
          <h3 className="text-xl font-semibold mb-4">Genre Popularity</h3>
          {genres.length > 0 ? (
            <ul className="space-y-1">
              {genres.map((g: any) => (
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
