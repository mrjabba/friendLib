'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'

export default function MenuSidebar() {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return <div className="my-5 px-8">Loading...</div>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <>
      <ul className="my-5 px-8 md:text-xl">
        <li>
          <button className="py-2">
            <Link href="/">Home</Link>
          </button>
        </li>
        <li>
          <button className="py-2">
            <Link href="/actions/book-add">Add</Link>
          </button>
        </li>
        <li>
          <button className="py-2">
            <Link href="/actions/book-search">Search</Link>
          </button>
        </li>
        <li className="pt-4">
          <UserButton />
        </li>
      </ul>
    </>
  )
}
