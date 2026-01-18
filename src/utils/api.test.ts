import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitForm } from './api';

describe('submitForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Mock console.log for dev mode tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('Dev Mode (No API Key)', () => {
    it('should log form data to console when no API key provided', async () => {
      const formData = { email: 'test@example.com', name: 'Test User' };

      const result = await submitForm(formData);

      expect(console.log).toHaveBeenCalledWith(
        '[FormFlow Dev Mode] Form submission:',
        formData
      );
      expect(result).toEqual({
        success: true,
        message: 'Development mode - submission logged to console',
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should work with empty form data in dev mode', async () => {
      const result = await submitForm({});

      expect(console.log).toHaveBeenCalledWith(
        '[FormFlow Dev Mode] Form submission:',
        {}
      );
      expect(result.success).toBe(true);
    });
  });

  describe('Production Mode (With API Key)', () => {
    it('should call FormFlow API with correct endpoint and headers', async () => {
      const formData = { email: 'test@example.com', name: 'John Doe' };
      const apiKey = 'test_api_key_123';

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissionId: 'sub_123' }),
      } as Response);

      await submitForm(formData, apiKey);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/submit'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-FormFlow-API-Key': apiKey,
          },
          body: JSON.stringify(formData),
        })
      );
    });

    it('should return success response with submission ID', async () => {
      const formData = { email: 'success@example.com' };
      const mockResponse = { submissionId: 'sub_456' };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await submitForm(formData, 'api_key');

      expect(result).toEqual({
        success: true,
        message: 'Form submitted successfully',
        submissionId: 'sub_456',
      });
    });

    it('should use default API URL (env variable is runtime config)', async () => {
      // Note: The API URL is set at module load time, so changing process.env
      // during test won't affect it. This test verifies default behavior.

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await submitForm({ email: 'test@example.com' }, 'api_key');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/submit'),
        expect.any(Object)
      );
    });

    it('should fallback to production URL when no env variable', async () => {
      delete process.env.NEXT_PUBLIC_FORMFLOW_API_URL;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await submitForm({ email: 'test@example.com' }, 'api_key');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://formflow.sh/api/submit',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          message: 'Invalid API key',
          error: 'Unauthorized',
        }),
      } as Response);

      const result = await submitForm({ email: 'test@example.com' }, 'invalid_key');

      expect(result).toEqual({
        success: false,
        message: 'Invalid API key',
        error: 'Unauthorized',
        signupUrl: undefined,
      });
    });

    it('should handle 402 Quota Exceeded error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 402,
        json: async () => ({
          message: 'Quota exceeded',
          error: 'Payment required',
        }),
      } as Response);

      const result = await submitForm({ email: 'test@example.com' }, 'api_key');

      expect(result).toEqual({
        success: false,
        message: 'Quota exceeded',
        error: 'Payment required',
        signupUrl: undefined,
      });
    });

    it('should handle 429 Rate Limit error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          message: 'Too many requests',
          error: 'Rate limit exceeded',
        }),
      } as Response);

      const result = await submitForm({ email: 'test@example.com' }, 'api_key');

      expect(result).toEqual({
        success: false,
        message: 'Too many requests',
        error: 'Rate limit exceeded',
        signupUrl: undefined,
      });
    });

    it('should handle 500 Server Error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          message: 'Internal server error',
        }),
      } as Response);

      const result = await submitForm({ email: 'test@example.com' }, 'api_key');

      expect(result).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined,
        signupUrl: undefined,
      });
    });

    it('should handle generic error response without message', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({}),
      } as Response);

      const result = await submitForm({ email: 'test@example.com' }, 'api_key');

      expect(result).toEqual({
        success: false,
        message: 'Submission failed',
        error: undefined,
        signupUrl: undefined,
      });
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const result = await submitForm({ email: 'test@example.com' }, 'api_key');

      expect(result).toEqual({
        success: false,
        message: 'Failed to submit form',
        error: 'Network error',
      });
    });

    it('should handle unknown errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce('Unknown error');

      const result = await submitForm({ email: 'test@example.com' }, 'api_key');

      expect(result).toEqual({
        success: false,
        message: 'Failed to submit form',
        error: 'Unknown error',
      });
    });

    it('should handle signup URL in API response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          message: 'API key required',
          signupUrl: 'https://formflow.sh/signup',
        }),
      } as Response);

      const result = await submitForm({ email: 'test@example.com' }, 'some_key');

      expect(result.success).toBe(false);
      expect(result.signupUrl).toBe('https://formflow.sh/signup');
    });
  });

  describe('Data Handling', () => {
    it('should handle complex form data with nested objects', async () => {
      const complexData = {
        user: {
          email: 'test@example.com',
          name: 'John Doe',
        },
        preferences: {
          newsletter: true,
          updates: false,
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissionId: 'sub_789' }),
      } as Response);

      await submitForm(complexData, 'api_key');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(complexData),
        })
      );
    });

    it('should handle arrays in form data', async () => {
      const dataWithArrays = {
        email: 'test@example.com',
        interests: ['coding', 'design', 'music'],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissionId: 'sub_999' }),
      } as Response);

      await submitForm(dataWithArrays, 'api_key');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(dataWithArrays),
        })
      );
    });

    it('should handle empty strings and null values', async () => {
      const dataWithEmpties = {
        email: 'test@example.com',
        name: '',
        company: null,
        message: undefined,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissionId: 'sub_000' }),
      } as Response);

      await submitForm(dataWithEmpties, 'api_key');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(dataWithEmpties),
        })
      );
    });
  });
});
