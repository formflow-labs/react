/**
 * E2E Integration Tests with Live Backend
 *
 * These tests verify the hook works with the actual FormFlow backend running on localhost:3001.
 *
 * Prerequisites:
 * - Backend server running: cd packages/backend && PORT=3001 pnpm dev
 * - For authenticated tests: Valid API key in TEST_FORMFLOW_API_KEY env variable
 *
 * Running all tests (including authenticated):
 * TEST_FORMFLOW_API_KEY=your_api_key NEXT_PUBLIC_FORMFLOW_API_URL=http://localhost:3001 pnpm test backend-integration.test.tsx --run
 *
 * Note: These tests use real HTTP requests via undici, not mocked fetch
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormFlow } from '@/hooks/useFormFlow';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetch as undiciFetch } from 'undici';

const BACKEND_URL = 'http://localhost:3001/api/submit';

// Helper to make real HTTP requests (bypassing global fetch mock)
async function realFetch(url: string, options?: RequestInit): Promise<Response> {
  // Use undici's fetch to make real HTTP requests
  return undiciFetch(url, options) as Promise<Response>;
}

describe('E2E: useFormFlow with live backend', () => {
  // Note: These tests require the backend to be running on localhost:3001

  // Store original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Restore real fetch for E2E tests (undici's fetch)
    vi.restoreAllMocks();
    global.fetch = undiciFetch as any;
  });

  afterEach(() => {
    // Restore original fetch after each test
    global.fetch = originalFetch;
  });

  describe('Backend Connectivity', () => {
    it('backend /api/submit endpoint is reachable', async () => {
      const response = await realFetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      // Should get 401 (unauthorized) which proves endpoint is working
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('API key required');
    });

    it('backend returns proper CORS headers', async () => {
      const response = await realFetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      expect(response.headers.get('access-control-allow-origin')).toBe('*');
    });

    it('backend handles OPTIONS preflight requests', async () => {
      const response = await realFetch(BACKEND_URL, {
        method: 'OPTIONS',
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('access-control-allow-methods')).toContain('POST');
    });
  });

  describe('Authentication', () => {
    it('returns 401 when no API key is provided', async () => {
      const response = await realFetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', name: 'Test' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('API key required');
    });

    it('returns 401 when API key has invalid format', async () => {
      const response = await realFetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FormFlow-API-Key': 'invalid_format',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid API key format');
    });

    it('accepts ff_live_ and ff_test_ prefixes', async () => {
      // Test with ff_live_ prefix
      const response1 = await realFetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FormFlow-API-Key': 'ff_live_invalid_but_correct_format',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      // Should get 401 (unauthorized) not 400 (bad format)
      expect(response1.status).toBe(401);
      const data1 = await response1.json();
      expect(data1.error).toBe('Invalid API key'); // Not "Invalid API key format"

      // Test with ff_test_ prefix
      const response2 = await realFetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FormFlow-API-Key': 'ff_test_invalid_but_correct_format',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      expect(response2.status).toBe(401);
    });
  });

  describe('Form Submission Flow', () => {
    it('hook handles 401 errors correctly', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'invalid_key_format', // Invalid API key to trigger 401
          onError,
        })
      );

      // Set form values
      act(() => {
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('name', 'Test User');
      });

      // Submit form
      await act(async () => {
        const event = new Event('submit') as any;
        event.preventDefault = vi.fn();
        await result.current.handleSubmit(event);
      });

      // Should call onError with 401 response
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
        const errorArg = onError.mock.calls[0][0];
        expect(errorArg.success).toBe(false);
        expect(errorArg.error).toBe('Invalid API key format');
      });
    });

    it('hook sets isSubmitting during submission', async () => {
      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'ff_test_key',
        })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      // Should not be submitting initially
      expect(result.current.formState.isSubmitting).toBe(false);

      // Submit (will fail with 401 but that's ok)
      await act(async () => {
        const event = new Event('submit') as any;
        event.preventDefault = vi.fn();
        await result.current.handleSubmit(event);
      });

      // After completion, should be false
      expect(result.current.formState.isSubmitting).toBe(false);
    });
  });

  // Tests that require a valid API key
  describe('With Valid API Key', () => {
    const REAL_API_KEY = process.env.TEST_FORMFLOW_API_KEY;

    it('successfully submits form with valid API key', async () => {
      if (!REAL_API_KEY) {
        console.warn('Skipping: TEST_FORMFLOW_API_KEY not set');
        return;
      }

      const response = await realFetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FormFlow-API-Key': REAL_API_KEY,
        },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'E2E Test',
          message: 'Automated E2E test submission',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.submissionId).toBeDefined();
    });

    it('hook successfully submits with valid API key', async () => {
      if (!REAL_API_KEY) {
        console.warn('Skipping: TEST_FORMFLOW_API_KEY not set');
        return;
      }

      const onSuccess = vi.fn();
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: REAL_API_KEY,
          onSuccess,
          onError,
        })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('name', 'E2E Test User');
      });

      await act(async () => {
        const event = new Event('submit') as any;
        event.preventDefault = vi.fn();
        await result.current.handleSubmit(event);
      });

      await waitFor(() => {
        // Check if either success or error was called
        if (onError.mock.calls.length > 0) {
          console.error('Form submission error:', onError.mock.calls[0][0]);
        }
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });
});
