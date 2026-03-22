'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import { getSession } from '@/app/lib/session'

export default async function ProtectedPage() {
  const session = await getSession()

  return (
    <div className="flex h-screen bg-black">
      <div className="w-screen h-screen flex flex-col space-y-5 justify-center items-center text-white">
        You are logged in as {session?.email}
        <SignOutButton redirectUrl="/sign-in">
          <button type="submit" className="text-red-400 hover:text-red-300">
            Sign out
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}
