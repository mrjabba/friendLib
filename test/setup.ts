import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
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

// `useFormStatus` ships with the React version Next.js bundles, but not with the
// standalone react-dom that Vitest resolves. Provide an idle status by default.
vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return {
    ...actual,
    useFormStatus: () => ({ pending: false, data: null, method: null, action: null }),
  }
})
