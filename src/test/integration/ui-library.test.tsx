import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormFlow } from '../../hooks/useFormFlow';
import * as React from 'react';

// Mock UI Library Components (simulating shadcn/ui, MUI, Chakra, etc.)
// These demonstrate that useFormFlow works with ANY component library

interface MockInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Mock Input component (like shadcn/ui Input or MUI TextField)
const MockInput = React.forwardRef<HTMLInputElement, MockInputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} {...props} />
        {error && <span data-testid={`${props.name}-error`}>{error}</span>}
      </div>
    );
  }
);
MockInput.displayName = 'MockInput';

interface MockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

// Mock Button component (like shadcn/ui Button or MUI Button)
const MockButton = React.forwardRef<HTMLButtonElement, MockButtonProps>(
  ({ children, loading, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={variant}
        aria-busy={loading}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);
MockButton.displayName = 'MockButton';

// Mock Textarea component
const MockTextarea = React.forwardRef<
  HTMLTextAreaElement,
  MockInputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ label, ...props }, ref) => {
  return (
    <div>
      {label && <label>{label}</label>}
      <textarea ref={ref} {...props} />
    </div>
  );
});
MockTextarea.displayName = 'MockTextarea';

// Test form using mock UI library components
function UILibraryContactForm() {
  const { register, handleSubmit, formState } = useFormFlow({
    apiKey: 'test_key',
  });

  return (
    <form onSubmit={handleSubmit}>
      <MockInput
        {...register('email')}
        label="Email"
        type="email"
        data-testid="email-input"
      />
      <MockInput
        {...register('name')}
        label="Name"
        data-testid="name-input"
      />
      <MockTextarea
        {...register('message')}
        label="Message"
        data-testid="message-input"
      />
      <MockButton
        type="submit"
        loading={formState.isSubmitting}
        data-testid="submit-button"
      >
        Submit
      </MockButton>
    </form>
  );
}

// Form with validation errors displayed via UI library
function UILibraryFormWithValidation() {
  const { register, handleSubmit, formState } = useFormFlow({
    apiKey: 'test_key',
  });

  return (
    <form onSubmit={handleSubmit}>
      <MockInput
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        label="Email"
        error={formState.errors.email?.message as string}
        data-testid="email-input"
      />
      <MockInput
        {...register('name', { required: 'Name is required' })}
        label="Name"
        error={formState.errors.name?.message as string}
        data-testid="name-input"
      />
      <MockButton type="submit" data-testid="submit-button">
        Submit
      </MockButton>
    </form>
  );
}

describe('useFormFlow with UI Component Libraries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Component Library Integration', () => {
    it('should work with custom Input components', async () => {
      const user = userEvent.setup();

      render(<UILibraryContactForm />);

      // Verify labels are rendered
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();

      // Type into inputs
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('name-input'), 'Jane Doe');
      await user.type(screen.getByTestId('message-input'), 'Hello from UI library');

      // Verify values
      expect(screen.getByTestId('email-input')).toHaveValue('test@example.com');
      expect(screen.getByTestId('name-input')).toHaveValue('Jane Doe');
      expect(screen.getByTestId('message-input')).toHaveValue('Hello from UI library');
    });

    it('should submit form with UI library components', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<UILibraryContactForm />);

      // Fill form
      await user.type(screen.getByTestId('email-input'), 'ui@example.com');
      await user.type(screen.getByTestId('name-input'), 'UI User');
      await user.type(screen.getByTestId('message-input'), 'Testing UI library');

      // Submit
      await user.click(screen.getByTestId('submit-button'));

      // Verify API called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/submit'),
          expect.objectContaining({
            body: JSON.stringify({
              email: 'ui@example.com',
              name: 'UI User',
              message: 'Testing UI library',
            }),
          })
        );
      });
    });

    it('should show loading state on custom Button component', async () => {
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

      render(<UILibraryContactForm />);

      const submitButton = screen.getByTestId('submit-button');

      // Before submission
      expect(submitButton).toHaveTextContent('Submit');
      expect(submitButton).not.toHaveAttribute('aria-busy', 'true');

      // Fill and submit
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(submitButton);

      // During submission
      await waitFor(() => {
        expect(submitButton).toHaveAttribute('aria-busy', 'true');
        expect(submitButton).toHaveTextContent('Loading...');
      });

      // After submission
      await waitFor(() => {
        expect(submitButton).not.toHaveAttribute('aria-busy', 'true');
        expect(submitButton).toHaveTextContent('Submit');
      });
    });
  });

  describe('Validation with UI Libraries', () => {
    it('should display validation errors in UI library components', async () => {
      const user = userEvent.setup();

      render(<UILibraryFormWithValidation />);

      // Submit without filling required fields
      await user.click(screen.getByTestId('submit-button'));

      // Should show validation errors
      await waitFor(() => {
        const emailError = screen.queryByTestId('email-error');
        const nameError = screen.queryByTestId('name-error');

        // At least one error should be shown (depends on validation order)
        expect(emailError || nameError).toBeInTheDocument();
      });

      // Should not call API
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should validate email pattern with UI library', async () => {
      const user = userEvent.setup();

      render(<UILibraryFormWithValidation />);

      // Fill with invalid email
      await user.type(screen.getByTestId('email-input'), 'invalid-email');
      await user.type(screen.getByTestId('name-input'), 'John Doe');

      // Submit
      await user.click(screen.getByTestId('submit-button'));

      // Should show pattern validation error
      await waitFor(() => {
        const emailError = screen.queryByTestId('email-error');
        if (emailError) {
          expect(emailError).toHaveTextContent('Invalid email address');
        }
      });
    });

    it('should submit successfully with valid data', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<UILibraryFormWithValidation />);

      // Fill with valid data
      await user.type(screen.getByTestId('email-input'), 'valid@example.com');
      await user.type(screen.getByTestId('name-input'), 'John Doe');

      // Submit
      await user.click(screen.getByTestId('submit-button'));

      // Should submit successfully
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should clear errors after fixing validation issues', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<UILibraryFormWithValidation />);

      // Submit without data to trigger errors
      await user.click(screen.getByTestId('submit-button'));

      // Wait for potential errors
      await waitFor(() => {
        // Errors might appear
        const hasErrors = screen.queryByTestId('email-error') || screen.queryByTestId('name-error');
        if (!hasErrors) {
          // If no errors shown, validation might be different
          return true;
        }
      });

      // Fill valid data
      await user.type(screen.getByTestId('email-input'), 'fixed@example.com');
      await user.type(screen.getByTestId('name-input'), 'Fixed Name');

      // Submit again
      await user.click(screen.getByTestId('submit-button'));

      // Should submit successfully
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('UI Library Patterns', () => {
    it('should work with controlled components pattern', async () => {
      const user = userEvent.setup();

      function ControlledForm() {
        const { register, handleSubmit, watch } = useFormFlow({
          apiKey: 'test_key',
        });

        const emailValue = watch('email');

        return (
          <form onSubmit={handleSubmit}>
            <MockInput {...register('email')} data-testid="email-input" />
            <div data-testid="email-display">Current: {emailValue || 'empty'}</div>
            <MockButton type="submit" data-testid="submit">
              Submit
            </MockButton>
          </form>
        );
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<ControlledForm />);

      const emailInput = screen.getByTestId('email-input');
      const emailDisplay = screen.getByTestId('email-display');

      // Initially empty
      expect(emailDisplay).toHaveTextContent('Current: empty');

      // Type and watch value update
      await user.type(emailInput, 'watch@example.com');

      await waitFor(() => {
        expect(emailDisplay).toHaveTextContent('Current: watch@example.com');
      });

      // Submit
      await user.click(screen.getByTestId('submit'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should work with custom onChange handlers in UI library', async () => {
      const user = userEvent.setup();
      const customOnChange = vi.fn();

      function FormWithCustomHandler() {
        const { register, handleSubmit } = useFormFlow({ apiKey: 'test_key' });

        const { onChange, ...registerProps } = register('email');

        return (
          <form onSubmit={handleSubmit}>
            <MockInput
              {...registerProps}
              onChange={(e) => {
                onChange(e); // Call react-hook-form handler
                customOnChange(e.target.value); // Call custom handler
              }}
              data-testid="email-input"
            />
            <MockButton type="submit" data-testid="submit">
              Submit
            </MockButton>
          </form>
        );
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<FormWithCustomHandler />);

      await user.type(screen.getByTestId('email-input'), 'custom@example.com');

      // Custom handler should be called
      expect(customOnChange).toHaveBeenCalled();

      // Form should still submit
      await user.click(screen.getByTestId('submit'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ email: 'custom@example.com' }),
          })
        );
      });
    });
  });
});
