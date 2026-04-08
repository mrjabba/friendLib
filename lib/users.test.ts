import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserById, getUserEmail, getUserName } from '@/lib/users'

// Use hoisted mock to avoid reference error
const { mockGetUser } = vi.hoisted(() => {
  return {
    mockGetUser: vi.fn(),
  }
})

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn().mockResolvedValue({
    users: {
      getUser: mockGetUser,
    },
  }),
}))

describe('users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserById', () => {
    it('returns user info when user exists', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
      }
      mockGetUser.mockResolvedValue(mockUser)

      const result = await getUserById('user_123')

      expect(result).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        name: 'John',
      })
    })

    it('returns null when user not found', async () => {
      mockGetUser.mockRejectedValue(new Error('User not found'))

      const result = await getUserById('invalid_user')

      expect(result).toBeNull()
    })

    it('returns name as undefined when firstName is missing', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: null,
      }
      mockGetUser.mockResolvedValue(mockUser)

      const result = await getUserById('user_123')

      expect(result?.name).toBeUndefined()
    })
  })

  describe('getUserEmail', () => {
    it('returns email address when user exists', async () => {
      mockGetUser.mockResolvedValue({
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
      })

      const result = await getUserEmail('user_123')

      expect(result).toBe('test@example.com')
    })

    it('returns null when user not found', async () => {
      mockGetUser.mockRejectedValue(new Error('Not found'))

      const result = await getUserEmail('invalid')

      expect(result).toBeNull()
    })
  })

  describe('getUserName', () => {
    it('returns name when user exists', async () => {
      mockGetUser.mockResolvedValue({
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
      })

      const result = await getUserName('user_123')

      expect(result).toBe('John')
    })

    it('returns null when user not found', async () => {
      mockGetUser.mockRejectedValue(new Error('Not found'))

      const result = await getUserName('invalid')

      expect(result).toBeNull()
    })

    it('returns null when firstName is null', async () => {
      mockGetUser.mockResolvedValue({
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: null,
      })

      const result = await getUserName('user_123')

      expect(result).toBeNull()
    })
  })
})
