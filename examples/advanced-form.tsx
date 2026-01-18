/**
 * Advanced Form Example
 *
 * Demonstrates advanced features:
 * - Default values
 * - Error handling with user-friendly messages
 * - Controlled components with watch()
 * - Custom onChange handlers
 * - Form reset
 */

import { useState } from 'react';
import { useFormFlow } from '@formflow.sh/react';

export function AdvancedForm() {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, handleSubmit, formState, watch, reset } = useFormFlow({
    apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
    // Initialize with default values
    defaultValues: {
      email: '',
      name: '',
      country: 'US',
      newsletter: true,
    },
    onSuccess: (data, response) => {
      setSuccessMessage(
        `Thank you! Your submission (ID: ${response.submissionId}) has been received.`
      );
      setErrorMessage('');
      console.log('Submitted:', data);
    },
    onError: (error: any) => {
      setSuccessMessage('');

      // Provide user-friendly error messages
      if (error.message?.includes('401')) {
        setErrorMessage('Invalid API key. Please check your configuration.');
      } else if (error.message?.includes('402')) {
        setErrorMessage(
          'Submission quota exceeded. Please upgrade your plan.'
        );
      } else if (error.message?.includes('429')) {
        setErrorMessage('Too many requests. Please try again in a few minutes.');
      } else if (error.message?.includes('Network')) {
        setErrorMessage(
          'Network error. Please check your internet connection and try again.'
        );
      } else {
        setErrorMessage(
          error.message || 'An unexpected error occurred. Please try again.'
        );
      }
    },
  });

  // Watch specific fields for conditional logic
  const watchNewsletter = watch('newsletter');
  const watchCountry = watch('country');

  const handleReset = () => {
    reset();
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="max-w-md">
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label htmlFor="name">Name *</label>
          <input
            {...register('name', {
              required: 'Name is required',
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

        <div>
          <label htmlFor="country">Country *</label>
          <select
            {...register('country', {
              required: 'Please select a country',
            })}
            id="country"
          >
            <option value="">Select...</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="OTHER">Other</option>
          </select>
          {formState.errors.country && (
            <span className="error">
              {formState.errors.country.message as string}
            </span>
          )}
        </div>

        {/* Conditional field based on watched value */}
        {watchCountry === 'OTHER' && (
          <div>
            <label htmlFor="countryOther">Please specify *</label>
            <input
              {...register('countryOther', {
                required: 'Please specify your country',
              })}
              id="countryOther"
              placeholder="Your country"
            />
            {formState.errors.countryOther && (
              <span className="error">
                {formState.errors.countryOther.message as string}
              </span>
            )}
          </div>
        )}

        <div>
          <label>
            <input {...register('newsletter')} type="checkbox" />
            Subscribe to newsletter
          </label>
        </div>

        {/* Show additional info based on newsletter selection */}
        {watchNewsletter && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              You'll receive our weekly newsletter with product updates and tips.
            </p>
          </div>
        )}

        {/* Form actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex-1"
          >
            {formState.isSubmitting ? 'Submitting...' : 'Submit'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={formState.isSubmitting}
            className="px-4"
          >
            Reset
          </button>
        </div>

        {/* Form state indicators */}
        <div className="text-xs text-gray-500">
          <p>Form state:</p>
          <ul className="list-disc list-inside">
            <li>Submitting: {formState.isSubmitting ? 'Yes' : 'No'}</li>
            <li>Valid: {formState.isValid ? 'Yes' : 'No'}</li>
            <li>
              Errors: {Object.keys(formState.errors).length || 'None'}
            </li>
          </ul>
        </div>
      </form>
    </div>
  );
}
