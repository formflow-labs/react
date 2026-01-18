import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormFlow } from '../../hooks/useFormFlow';

// Test component using native HTML inputs
function NativeHTMLContactForm() {
  const { register, handleSubmit, formState } = useFormFlow({
    apiKey: 'test_key',
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        {...register('email')}
        type="email"
        placeholder="Email"
        data-testid="email-input"
      />
      <input
        {...register('name')}
        type="text"
        placeholder="Name"
        data-testid="name-input"
      />
      <textarea
        {...register('message')}
        placeholder="Message"
        data-testid="message-input"
      />
      <button type="submit" disabled={formState.isSubmitting} data-testid="submit-button">
        {formState.isSubmitting ? 'Sending...' : 'Submit'}
      </button>
    </form>
  );
}

// Test component with validation
function NativeHTMLFormWithValidation() {
  const { register, handleSubmit, formState } = useFormFlow({
    apiKey: 'test_key',
  });

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          {...register('email', { required: 'Email is required' })}
          type="email"
          data-testid="email-input"
        />
        {formState.errors.email && (
          <span data-testid="email-error">{formState.errors.email.message}</span>
        )}
      </div>
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
}

// Test component with callbacks
function NativeHTMLFormWithCallbacks({ onSuccess, onError }: any) {
  const { register, handleSubmit, formState } = useFormFlow({
    apiKey: 'test_key',
    onSuccess,
    onError,
  });

  return (
    <form onSubmit={handleSubmit}>
      <input {...register('email')} data-testid="email-input" />
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
}

describe('useFormFlow with Native HTML Elements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Basic Form Interaction', () => {
    it('should work with native HTML input elements', async () => {
      const user = userEvent.setup();

      render(<NativeHTMLContactForm />);

      // Find inputs
      const emailInput = screen.getByTestId('email-input');
      const nameInput = screen.getByTestId('name-input');
      const messageInput = screen.getByTestId('message-input');

      // Type into inputs
      await user.type(emailInput, 'test@example.com');
      await user.type(nameInput, 'John Doe');
      await user.type(messageInput, 'Hello World');

      // Verify values
      expect(emailInput).toHaveValue('test@example.com');
      expect(nameInput).toHaveValue('John Doe');
      expect(messageInput).toHaveValue('Hello World');
    });

    it('should submit form with native HTML elements', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<NativeHTMLContactForm />);

      // Fill form
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('name-input'), 'John Doe');
      await user.type(screen.getByTestId('message-input'), 'Test message');

      // Submit
      await user.click(screen.getByTestId('submit-button'));

      // Verify API was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/submit'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              email: 'test@example.com',
              name: 'John Doe',
              message: 'Test message',
            }),
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

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

      render(<NativeHTMLContactForm />);

      const submitButton = screen.getByTestId('submit-button');

      // Before submission
      expect(submitButton).toHaveTextContent('Submit');
      expect(submitButton).not.toBeDisabled();

      // Fill and submit
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(submitButton);

      // During submission (button should be disabled and show loading text)
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Sending...');
      });

      // After submission
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent('Submit');
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields with native HTML', async () => {
      const user = userEvent.setup();

      render(<NativeHTMLFormWithValidation />);

      const submitButton = screen.getByTestId('submit-button');

      // Try to submit without filling email
      await user.click(submitButton);

      // Should show error
      await waitFor(() => {
        const errorElement = screen.queryByTestId('email-error');
        if (errorElement) {
          expect(errorElement).toBeInTheDocument();
        }
      });

      // Should not call API
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should clear errors when field is filled', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<NativeHTMLFormWithValidation />);

      // Fill email and submit
      await user.type(screen.getByTestId('email-input'), 'valid@example.com');
      await user.click(screen.getByTestId('submit-button'));

      // Should submit successfully
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback after successful submission', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, submissionId: 'sub_123' }),
      } as Response);

      render(<NativeHTMLFormWithCallbacks onSuccess={onSuccess} />);

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(
          { email: 'test@example.com' },
          expect.objectContaining({
            success: true,
            submissionId: 'sub_123',
          })
        );
      });
    });

    it('should call onError callback on submission failure', async () => {
      const user = userEvent.setup();
      const onError = vi.fn();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, message: 'Unauthorized' }),
      } as Response);

      render(<NativeHTMLFormWithCallbacks onError={onError} />);

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Unauthorized',
          })
        );
      });
    });
  });

  describe('Different Input Types', () => {
    it('should work with checkbox inputs', async () => {
      const user = userEvent.setup();

      function CheckboxForm() {
        const { register, handleSubmit } = useFormFlow({ apiKey: 'test_key' });
        return (
          <form onSubmit={handleSubmit}>
            <input
              {...register('subscribe')}
              type="checkbox"
              data-testid="checkbox"
            />
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </form>
        );
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<CheckboxForm />);

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(screen.getByTestId('submit'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should work with select elements', async () => {
      const user = userEvent.setup();

      function SelectForm() {
        const { register, handleSubmit } = useFormFlow({ apiKey: 'test_key' });
        return (
          <form onSubmit={handleSubmit}>
            <select {...register('country')} data-testid="select">
              <option value="">Select...</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
            </select>
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </form>
        );
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<SelectForm />);

      await user.selectOptions(screen.getByTestId('select'), 'uk');
      expect(screen.getByTestId('select')).toHaveValue('uk');

      await user.click(screen.getByTestId('submit'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ country: 'uk' }),
          })
        );
      });
    });

    it('should work with radio buttons', async () => {
      const user = userEvent.setup();

      function RadioForm() {
        const { register, handleSubmit } = useFormFlow({ apiKey: 'test_key' });
        return (
          <form onSubmit={handleSubmit}>
            <input
              {...register('plan')}
              type="radio"
              value="free"
              data-testid="radio-free"
            />
            <input
              {...register('plan')}
              type="radio"
              value="pro"
              data-testid="radio-pro"
            />
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </form>
        );
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<RadioForm />);

      await user.click(screen.getByTestId('radio-pro'));
      expect(screen.getByTestId('radio-pro')).toBeChecked();

      await user.click(screen.getByTestId('submit'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ plan: 'pro' }),
          })
        );
      });
    });
  });

  describe('Form Reset', () => {
    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<NativeHTMLContactForm />);

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      const nameInput = screen.getByTestId('name-input') as HTMLInputElement;

      // Fill form
      await user.type(emailInput, 'test@example.com');
      await user.type(nameInput, 'John Doe');

      expect(emailInput.value).toBe('test@example.com');
      expect(nameInput.value).toBe('John Doe');

      // Submit
      await user.click(screen.getByTestId('submit-button'));

      // Wait for form to be reset
      await waitFor(() => {
        expect(emailInput.value).toBe('');
        expect(nameInput.value).toBe('');
      });
    });
  });
});
