import { clerkClient } from '@clerk/nextjs/server'

export interface UserInfo {
  id: string
  email: string | undefined
  name: string | undefined
}

export async function getUserById(userId: string): Promise<UserInfo | null> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: user.firstName || undefined,
    }
  } catch {
    return null
  }
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const user = await getUserById(userId)
  return user?.email || null
}

export async function getUserName(userId: string): Promise<string | null> {
  const user = await getUserById(userId)
  return user?.name || null
}
