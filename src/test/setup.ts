import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js features
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    item: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb({
      item: { update: vi.fn(), create: vi.fn() },
      itemView: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
      itemMetric: { upsert: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    })),
  },
}));

// Mock Auth
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn() },
  })),
}));

vi.mock('@/lib/resend', () => ({
  resend: { emails: { send: vi.fn() } },
}));

// Mock Redis
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  },
}));

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Rate Limit
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 10, resetIn: 1000 }),
}));


