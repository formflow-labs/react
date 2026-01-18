/**
 * Basic Contact Form Example
 *
 * Demonstrates the simplest use of useFormFlow with native HTML elements.
 * Perfect for getting started quickly.
 */

import { useFormFlow } from '@formflow.sh/react';

export function BasicContactForm() {
  const { register, handleSubmit, formState } = useFormFlow({
    apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
    onSuccess: (data) => {
      alert('Form submitted successfully!');
      console.log('Submitted data:', data);
    },
    onError: (error) => {
      alert('Error submitting form');
      console.error('Error:', error);
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          {...register('email')}
          id="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="name">Name</label>
        <input
          {...register('name')}
          id="name"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          {...register('message')}
          id="message"
          placeholder="Your message..."
          rows={4}
          required
        />
      </div>

      <button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Sending...' : 'Submit'}
      </button>
    </form>
  );
}
