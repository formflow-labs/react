import * as React from 'react';
import { FormFlow, useFormFlowApiKey } from '../components/FormFlow';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { SubmitButton } from '../components/SubmitButton';
import { cn } from '../utils/cn';
import type { Theme } from '../types';
import type { SubmitResponse } from '../utils/api';

export interface FeedbackFormProps {
  /** FormFlow API key. Optional in dev mode. */
  apiKey?: string;
  /** Theme style: minimal, modern, brutalist, or glass */
  theme?: Theme;
  /** Custom class name */
  className?: string;
  /** Rating type: stars (1-5) or nps (0-10) */
  ratingType?: 'stars' | 'nps';
  /** Show name field */
  showName?: boolean;
  /** Show email field */
  showEmail?: boolean;
  /** Submit button text */
  submitText?: string;
  /** Success callback */
  onSuccess?: (data: FeedbackFormData) => void;
  /** Error callback */
  onError?: (error: Error | SubmitResponse) => void;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Question text */
  question?: string;
}

export interface FeedbackFormData {
  rating: number;
  feedback?: string;
  name?: string;
  email?: string;
}

/**
 * FeedbackForm - Collect user feedback with ratings and comments.
 *
 * @example
 * // Basic usage with 5-star rating
 * <FeedbackForm />
 *
 * @example
 * // NPS rating (0-10)
 * <FeedbackForm
 *   ratingType="nps"
 *   question="How likely are you to recommend us?"
 * />
 *
 * @example
 * // With contact info
 * <FeedbackForm
 *   showName
 *   showEmail
 *   title="How did we do?"
 * />
 */
export function FeedbackForm({
  apiKey,
  theme = 'minimal',
  className,
  ratingType = 'stars',
  showName = false,
  showEmail = false,
  submitText = 'Submit feedback',
  onSuccess,
  onError,
  title = 'Share your feedback',
  description,
  question = 'How would you rate your experience?',
}: FeedbackFormProps) {
  const globalApiKey = useFormFlowApiKey();
  const effectiveApiKey = apiKey || globalApiKey || undefined;

  const [rating, setRating] = React.useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (rating === null) {
      newErrors.rating = 'Please select a rating';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: Record<string, any>) => {
    if (!validateForm()) {
      throw new Error('Validation failed');
    }

    data.rating = rating;
    setIsSubmitting(true);
  };

  const handleSuccess = (data: Record<string, any>) => {
    setIsSubmitting(false);
    setRating(null);
    setErrors({});
    onSuccess?.(data as FeedbackFormData);
  };

  const handleError = (error: Error | SubmitResponse) => {
    setIsSubmitting(false);
    onError?.(error);
  };

  const renderStarRating = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(null)}
          className="p-1 transition-transform hover:scale-110 focus:outline-none"
        >
          <svg
            className={cn(
              'w-8 h-8 transition-colors',
              (hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      ))}
    </div>
  );

  const renderNPSRating = () => (
    <div className="flex gap-1">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => setRating(num)}
          className={cn(
            'w-8 h-8 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black',
            rating === num
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {num}
        </button>
      ))}
    </div>
  );

  return (
    <FormFlow
      apiKey={effectiveApiKey}
      theme={theme}
      className={className}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onError={handleError}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">{question}</label>
        {ratingType === 'stars' ? renderStarRating() : renderNPSRating()}
        {errors.rating && (
          <p className="text-sm text-red-500">{errors.rating}</p>
        )}
        {ratingType === 'nps' && (
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
        )}
      </div>

      <input type="hidden" name="rating" value={rating || ''} />

      <Textarea
        name="feedback"
        label="Additional comments"
        placeholder="Tell us more about your experience..."
        rows={3}
      />

      {showName && (
        <Input
          name="name"
          label="Name"
          placeholder="Your name (optional)"
          autoComplete="name"
        />
      )}

      {showEmail && (
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="your@email.com (optional)"
          autoComplete="email"
        />
      )}

      <SubmitButton loading={isSubmitting}>{submitText}</SubmitButton>
    </FormFlow>
  );
}
