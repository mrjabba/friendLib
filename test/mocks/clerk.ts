import { vi } from 'vitest'

export const mockSignedInUser = {
  isSignedIn: true,
  isLoaded: true,
  user: {
    id: 'user_test123',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  },
}

export const mockSignedOutUser = {
  isSignedIn: false,
  isLoaded: true,
  user: null,
}

export const mockLoadingUser = {
  isSignedIn: false,
  isLoaded: false,
  user: null,
}

export function createMockUser(overrides = {}) {
  return {
    isSignedIn: true,
    isLoaded: true,
    user: {
      id: 'user_test123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      ...overrides,
    },
  }
}

export function setupClerkMock(mockUser = mockSignedInUser) {
  vi.mock('@clerk/nextjs', () => ({
    useUser: () => mockUser,
    useAuth: () => [null, mockUser.isSignedIn, mockUser.isLoaded],
    auth: vi.fn().mockResolvedValue({ userId: mockUser.user?.id || null }),
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    SignedIn: ({ children }: { children: React.ReactNode }) => children,
    SignedOut: ({ children }: { children: React.ReactNode }) => null,
    SignIn: () => null,
    SignUp: () => null,
    UserButton: () => null,
    SignOutButton: ({ children }: { children?: React.ReactNode }) => children || null,
  }))
}

export function mockAuth(userId: string | null = 'user_test123') {
  return vi.fn().mockResolvedValue({ userId })
}
