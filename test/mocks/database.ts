import { vi } from 'vitest'

export function createCollectionMock() {
  return {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            groupBy: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({}),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue({}),
      execute: vi.fn().mockResolvedValue({}),
    })),
  }
}

export function createDbMock() {
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
          execute: vi.fn().mockResolvedValue([]),
        })),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            groupBy: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({}),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue({}),
      execute: vi.fn().mockResolvedValue({}),
    })),
  }
}
