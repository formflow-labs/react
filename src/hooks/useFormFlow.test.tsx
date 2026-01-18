import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormFlow } from './useFormFlow';

describe('useFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Field Registration', () => {
    it('should register fields and return correct props', () => {
      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      const emailProps = result.current.register('email');

      expect(emailProps).toHaveProperty('name', 'email');
      expect(emailProps).toHaveProperty('onChange');
      expect(emailProps).toHaveProperty('onBlur');
      expect(emailProps).toHaveProperty('ref');
    });

    it('should register multiple fields independently', () => {
      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      const emailProps = result.current.register('email');
      const nameProps = result.current.register('name');
      const messageProps = result.current.register('message');

      expect(emailProps.name).toBe('email');
      expect(nameProps.name).toBe('name');
      expect(messageProps.name).toBe('message');
    });

    it('should support validation options on registration', () => {
      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      const emailProps = result.current.register('email', {
        required: 'Email is required',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address',
        },
      });

      expect(emailProps.name).toBe('email');
    });
  });

  describe('Form Submission', () => {
    it('should submit form to FormFlow API with correct data', async () => {
      const onSuccess = vi.fn();
      const mockResponse = {
        success: true,
        message: 'Form submitted successfully',
        submissionId: 'sub_123',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'test_key',
          onSuccess,
        })
      );

      // Set field values using setValue
      act(() => {
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('name', 'John Doe');
      });

      // Submit form
      await act(async () => {
        await result.current.handleSubmit();
      });

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/submit'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-FormFlow-API-Key': 'test_key',
          }),
          body: JSON.stringify({
            email: 'test@example.com',
            name: 'John Doe',
          }),
        })
      );

      // Verify success callback was called
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(
          { email: 'test@example.com', name: 'John Doe' },
          mockResponse
        );
      });
    });

    it('should handle form submission without API key (dev mode)', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useFormFlow({
          // No API key
        })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      // In dev mode, it should log to console
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FormFlow Dev Mode] Form submission:',
        expect.objectContaining({ email: 'test@example.com' })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('should toggle isSubmitting state during submission', async () => {
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ success: true }),
              } as Response);
            }, 100);
          })
      );

      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      // Before submission
      expect(result.current.formState.isSubmitting).toBe(false);

      // Start submission
      const submitPromise = act(async () => {
        await result.current.handleSubmit();
      });

      // Wait for promise to complete
      await submitPromise;

      // After submission
      await waitFor(() => {
        expect(result.current.formState.isSubmitting).toBe(false);
      });
    });
  });

  describe('Success Handling', () => {
    it('should call onSuccess callback with form data and response', async () => {
      const onSuccess = vi.fn();
      const mockApiResponse = {
        success: true,
        submissionId: 'sub_456',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'test_key',
          onSuccess,
        })
      );

      act(() => {
        result.current.setValue('email', 'success@example.com');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(
          { email: 'success@example.com' },
          expect.objectContaining({
            success: true,
            submissionId: 'sub_456',
            message: 'Form submitted successfully',
          })
        );
      });
    });

    it('should reset form after successful submission', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'test_key',
          defaultValues: { email: '', name: '' },
        })
      );

      // Set values
      act(() => {
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('name', 'John');
      });

      // Verify values are set
      expect(result.current.getValues()).toEqual({
        email: 'test@example.com',
        name: 'John',
      });

      // Submit
      await act(async () => {
        await result.current.handleSubmit();
      });

      // Wait for reset
      await waitFor(() => {
        const values = result.current.getValues();
        expect(values.email).toBe('');
        expect(values.name).toBe('');
      });
    });
  });

  describe('Error Handling', () => {
    it('should call onError callback when API returns error', async () => {
      const onError = vi.fn();
      const mockErrorResponse = {
        success: false,
        message: 'Invalid API key',
        error: 'Unauthorized',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockErrorResponse,
      } as Response);

      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'invalid_key',
          onError,
        })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Invalid API key',
          })
        );
      });
    });

    it('should handle network errors', async () => {
      const onError = vi.fn();

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'test_key',
          onError,
        })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        // API utility catches errors and returns a SubmitResponse object
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Failed to submit form',
            error: 'Network error',
          })
        );
      });
    });

    it('should handle rate limiting (429)', async () => {
      const onError = vi.fn();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          message: 'Rate limit exceeded',
        }),
      } as Response);

      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'test_key',
          onError,
        })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Rate limit'),
          })
        );
      });
    });
  });

  describe('Field Updates', () => {
    it('should update field values with setValue', () => {
      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      act(() => {
        result.current.setValue('email', 'new@example.com');
      });

      expect(result.current.getValues().email).toBe('new@example.com');
    });

    it('should update multiple fields independently', () => {
      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('name', 'Jane Doe');
        result.current.setValue('message', 'Hello World');
      });

      const values = result.current.getValues();
      expect(values.email).toBe('test@example.com');
      expect(values.name).toBe('Jane Doe');
      expect(values.message).toBe('Hello World');
    });
  });

  describe('Form Reset', () => {
    it('should reset form to default values', () => {
      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'test_key',
          defaultValues: { email: 'default@example.com', name: 'Default' },
        })
      );

      // Change values
      act(() => {
        result.current.setValue('email', 'changed@example.com');
        result.current.setValue('name', 'Changed');
      });

      expect(result.current.getValues()).toEqual({
        email: 'changed@example.com',
        name: 'Changed',
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.getValues()).toEqual({
        email: 'default@example.com',
        name: 'Default',
      });
    });

    it('should reset form to empty values when no defaults', () => {
      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('name', 'Test');
      });

      act(() => {
        result.current.reset();
      });

      const values = result.current.getValues();
      expect(values.email).toBeUndefined();
      expect(values.name).toBeUndefined();
    });
  });

  describe('Default Values', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'test_key',
          defaultValues: {
            email: 'initial@example.com',
            name: 'Initial Name',
            subscribe: true,
          },
        })
      );

      const values = result.current.getValues();
      expect(values.email).toBe('initial@example.com');
      expect(values.name).toBe('Initial Name');
      expect(values.subscribe).toBe(true);
    });

    it('should work without default values', () => {
      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      const values = result.current.getValues();
      expect(values).toEqual({});
    });
  });

  describe('Validation', () => {
    it('should validate required fields before submission', async () => {
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useFormFlow({
          apiKey: 'test_key',
          onSuccess,
        })
      );

      // Register field with required validation
      result.current.register('email', { required: 'Email is required' });

      // Try to submit without setting value
      await act(async () => {
        await result.current.handleSubmit();
      });

      // Should not call API or success callback due to validation failure
      expect(global.fetch).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should support email pattern validation', () => {
      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      const emailProps = result.current.register('email', {
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email',
        },
      });

      expect(emailProps.name).toBe('email');
    });
  });

  describe('React Hook Form Integration', () => {
    it('should expose all react-hook-form methods', () => {
      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      // Verify all expected methods are available
      expect(result.current.register).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.formState).toBeDefined();
      expect(result.current.setValue).toBeDefined();
      expect(result.current.getValues).toBeDefined();
      expect(result.current.reset).toBeDefined();
      expect(result.current.watch).toBeDefined();
      expect(result.current.trigger).toBeDefined();
      expect(result.current.setError).toBeDefined();
      expect(result.current.clearErrors).toBeDefined();
    });

    it('should provide formState with isSubmitting', () => {
      const { result } = renderHook(() =>
        useFormFlow({ apiKey: 'test_key' })
      );

      expect(result.current.formState).toHaveProperty('isSubmitting');
      expect(result.current.formState.isSubmitting).toBe(false);
    });
  });
});
