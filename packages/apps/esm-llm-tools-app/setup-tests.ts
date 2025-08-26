import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock workbox-window module
vi.mock('workbox-window', () => {
  return {
    Workbox: vi.fn().mockImplementation(() => ({
      register: vi.fn(),
      messageSW: vi.fn(),
    })),
  };
});

// Mock navigator for flatpickr
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (compatible; Test Browser)',
  },
  writable: true,
});

afterEach(cleanup);
