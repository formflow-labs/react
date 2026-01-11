import * as React from 'react';
import { FormFlow, useFormFlowApiKey } from '../components/FormFlow';
import { Input } from '../components/Input';
import { SubmitButton } from '../components/SubmitButton';
import { validateEmail } from '../utils/validation';
import type { Theme } from '../types';
import type { SubmitResponse } from '../utils/api';

export interface NewsletterFormProps {
  /** FormFlow API key. Optional in dev mode. */
  apiKey?: string;
  /** Mailchimp API key for direct integration */
  mailchimpApiKey?: string;
  /** Mailchimp list/audience ID */
  mailchimpListId?: string;
  /** Theme style: minimal, modern, brutalist, or glass */
  theme?: Theme;
  /** Custom class name */
  className?: string;
  /** Show first name field */
  showName?: boolean;
  /** Submit button text */
  submitText?: string;
  /** Success callback */
  onSuccess?: (data: NewsletterFormData) => void;
  /** Error callback */
  onError?: (error: Error | SubmitResponse) => void;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Inline mode (horizontal layout) */
  inline?: boolean;
}

export interface NewsletterFormData {
  email: string;
  firstName?: string;
}

/**
 * NewsletterForm - Simple email signup form with optional Mailchimp integration.
 *
 * @example
 * // Basic usage
 * <NewsletterForm />
 *
 * @example
 * // With Mailchimp integration
 * <NewsletterForm
 *   apiKey="ff_live_abc123"
 *   mailchimpApiKey={process.env.MAILCHIMP_API_KEY}
 *   mailchimpListId="abc123"
 * />
 *
 * @example
 * // Inline mode with name field
 * <NewsletterForm
 *   inline
 *   showName
 *   title="Stay updated"
 *   description="Get the latest news in your inbox"
 * />
 */
export function NewsletterForm({
  apiKey,
  mailchimpApiKey,
  mailchimpListId,
  theme = 'minimal',
  className,
  showName = false,
  submitText = 'Subscribe',
  onSuccess,
  onError,
  title,
  description,
  inline = false,
}: NewsletterFormProps) {
  const globalApiKey = useFormFlowApiKey();
  const effectiveApiKey = apiKey || globalApiKey || undefined;

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = (data: NewsletterFormData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: Record<string, any>) => {
    const formData = data as NewsletterFormData;

    if (!validateForm(formData)) {
      throw new Error('Validation failed');
    }

    setIsSubmitting(true);

    // If Mailchimp is configured, include it in the submission metadata
    if (mailchimpApiKey && mailchimpListId) {
      data._mailchimp = {
        apiKey: mailchimpApiKey,
        listId: mailchimpListId,
      };
    }
  };

  const handleSuccess = (data: Record<string, any>) => {
    setIsSubmitting(false);
    setErrors({});
    onSuccess?.(data as NewsletterFormData);
  };

  const handleError = (error: Error | SubmitResponse) => {
    setIsSubmitting(false);
    onError?.(error);
  };

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
        <div className={inline ? 'mb-4' : 'mb-6'}>
          {title && (
            <h2
              className={
                inline ? 'text-lg font-semibold' : 'text-2xl font-bold tracking-tight'
              }
            >
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>
      )}

      {inline ? (
        <div className="flex gap-2">
          {showName && (
            <Input
              name="firstName"
              placeholder="First name"
              className="flex-1"
              error={errors.firstName}
              autoComplete="given-name"
            />
          )}
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="flex-1"
            error={errors.email}
            autoComplete="email"
          />
          <SubmitButton loading={isSubmitting} className="w-auto px-6">
            {submitText}
          </SubmitButton>
        </div>
      ) : (
        <>
          {showName && (
            <Input
              name="firstName"
              label="First name"
              placeholder="Your first name"
              error={errors.firstName}
              autoComplete="given-name"
            />
          )}

          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            required
            error={errors.email}
            autoComplete="email"
          />

          <SubmitButton loading={isSubmitting}>{submitText}</SubmitButton>
        </>
      )}

      {mailchimpApiKey && mailchimpListId && (
        <input type="hidden" name="_integration" value="mailchimp" />
      )}
    </FormFlow>
  );
}
