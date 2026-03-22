import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    isLoaded: true,
    user: {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
  useAuth: () => [{}],
  auth: vi.fn().mockResolvedValue({ userId: 'user_123' }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: ({ children }: { children: React.ReactNode }) => null,
  SignIn: () => null,
  SignUp: () => null,
  UserButton: () => null,
  SignOutButton: ({ children }: { children?: React.ReactNode }) => children || null,
}))

global.fetch = vi.fn()

global.window = global.window || ({} as any)
