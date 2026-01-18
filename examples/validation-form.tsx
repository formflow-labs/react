/**
 * Form Validation Example
 *
 * Demonstrates comprehensive form validation using react-hook-form patterns.
 * Shows required fields, pattern matching, min/max validation, and custom rules.
 */

import { useFormFlow } from '@formflow.sh/react';

export function ValidationForm() {
  const { register, handleSubmit, formState } = useFormFlow({
    apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
    onSuccess: () => {
      alert('Form submitted successfully!');
    },
    onError: (error) => {
      console.error('Submission failed:', error);
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {/* Email with pattern validation */}
      <div>
        <label htmlFor="email">Email *</label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          id="email"
          type="email"
          placeholder="you@example.com"
        />
        {formState.errors.email && (
          <span className="error">
            {formState.errors.email.message as string}
          </span>
        )}
      </div>

      {/* Name with min/max length */}
      <div>
        <label htmlFor="name">Name *</label>
        <input
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
            maxLength: {
              value: 50,
              message: 'Name must be less than 50 characters',
            },
          })}
          id="name"
          placeholder="John Doe"
        />
        {formState.errors.name && (
          <span className="error">
            {formState.errors.name.message as string}
          </span>
        )}
      </div>

      {/* Age with number validation */}
      <div>
        <label htmlFor="age">Age *</label>
        <input
          {...register('age', {
            required: 'Age is required',
            min: {
              value: 18,
              message: 'You must be at least 18 years old',
            },
            max: {
              value: 120,
              message: 'Please enter a valid age',
            },
            valueAsNumber: true,
          })}
          id="age"
          type="number"
          placeholder="25"
        />
        {formState.errors.age && (
          <span className="error">
            {formState.errors.age.message as string}
          </span>
        )}
      </div>

      {/* Phone with custom pattern */}
      <div>
        <label htmlFor="phone">Phone (optional)</label>
        <input
          {...register('phone', {
            pattern: {
              value: /^[\d\s\-+()]{10,}$/,
              message: 'Invalid phone number format',
            },
          })}
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
        />
        {formState.errors.phone && (
          <span className="error">
            {formState.errors.phone.message as string}
          </span>
        )}
      </div>

      {/* Password with custom validation */}
      <div>
        <label htmlFor="password">Password *</label>
        <input
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            validate: {
              hasUpperCase: (value) =>
                /[A-Z]/.test(value) || 'Password must contain an uppercase letter',
              hasLowerCase: (value) =>
                /[a-z]/.test(value) || 'Password must contain a lowercase letter',
              hasNumber: (value) =>
                /\d/.test(value) || 'Password must contain a number',
            },
          })}
          id="password"
          type="password"
          placeholder="••••••••"
        />
        {formState.errors.password && (
          <span className="error">
            {formState.errors.password.message as string}
          </span>
        )}
      </div>

      {/* Terms checkbox */}
      <div>
        <label>
          <input
            {...register('terms', {
              required: 'You must accept the terms and conditions',
            })}
            type="checkbox"
          />
          I agree to the terms and conditions *
        </label>
        {formState.errors.terms && (
          <span className="error">
            {formState.errors.terms.message as string}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="w-full"
      >
        {formState.isSubmitting ? 'Submitting...' : 'Submit'}
      </button>

      <p className="text-sm text-gray-500">* Required fields</p>
    </form>
  );
}
