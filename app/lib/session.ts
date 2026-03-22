import { auth, currentUser } from '@clerk/nextjs/server'

export async function getSession() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  if (!user) return null

  return {
    id: userId,
    email: user.emailAddresses[0]?.emailAddress || undefined,
    name: user.firstName || undefined,
  }
}
