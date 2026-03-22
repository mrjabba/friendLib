import { vi } from 'vitest'

export function setupRouterMock(overrides = {}) {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn().mockResolvedValue(true),
      replace: vi.fn().mockResolvedValue(true),
      prefetch: vi.fn().mockResolvedValue(undefined),
      back: vi.fn(),
      ...overrides,
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: vi.fn((url: string) => {
      throw new Error(`redirect to ${url}`)
    }),
    permanentRedirect: vi.fn((url: string) => {
      throw new Error(`permanent redirect to ${url}`)
    }),
  }))
}

export function mockSearchParams(params: Record<string, string> = {}) {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(params),
    usePathname: () => '/',
    useParams: () => ({}),
    redirect: vi.fn(),
    permanentRedirect: vi.fn(),
  }))
}
