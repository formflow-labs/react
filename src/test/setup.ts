import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock fetch globally
global.fetch = vi.fn();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
