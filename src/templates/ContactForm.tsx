import * as React from 'react';
import { FormFlow, useFormFlowApiKey } from '../components/FormFlow';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { SubmitButton } from '../components/SubmitButton';
import { validateEmail } from '../utils/validation';
import type { Theme } from '../types';
import type { SubmitResponse } from '../utils/api';

export interface ContactFormProps {
  /** FormFlow API key. Optional in dev mode. */
  apiKey?: string;
  /** Theme style: minimal, modern, brutalist, or glass */
  theme?: Theme;
  /** Custom class name */
  className?: string;
  /** Show subject field */
  showSubject?: boolean;
  /** Show phone field */
  showPhone?: boolean;
  /** Submit button text */
  submitText?: string;
  /** Success callback */
  onSuccess?: (data: ContactFormData) => void;
  /** Error callback */
  onError?: (error: Error | SubmitResponse) => void;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  phone?: string;
  message: string;
}

/**
 * ContactForm - Beautiful contact form with name, email, and message fields.
 *
 * @example
 * // Basic usage (dev mode - submissions logged to console)
 * <ContactForm />
 *
 * @example
 * // With API key (production)
 * <ContactForm apiKey="ff_live_abc123" />
 *
 * @example
 * // With all options
 * <ContactForm
 *   apiKey="ff_live_abc123"
 *   theme="modern"
 *   showSubject
 *   showPhone
 *   title="Get in touch"
 *   description="We'd love to hear from you"
 *   onSuccess={(data) => console.log('Submitted:', data)}
 * />
 */
export function ContactForm({
  apiKey,
  theme = 'minimal',
  className,
  showSubject = false,
  showPhone = false,
  submitText = 'Send message',
  onSuccess,
  onError,
  title,
  description,
}: ContactFormProps) {
  const globalApiKey = useFormFlowApiKey();
  const effectiveApiKey = apiKey || globalApiKey || undefined;

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = (data: ContactFormData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.message?.trim()) {
      newErrors.message = 'Message is required';
    } else if (data.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: Record<string, any>) => {
    const formData = data as ContactFormData;

    if (!validateForm(formData)) {
      throw new Error('Validation failed');
    }

    setIsSubmitting(true);
  };

  const handleSuccess = (data: Record<string, any>) => {
    setIsSubmitting(false);
    setErrors({});
    onSuccess?.(data as ContactFormData);
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
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      <Input
        name="name"
        label="Name"
        placeholder="Your name"
        required
        error={errors.name}
        autoComplete="name"
      />

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
        error={errors.email}
        autoComplete="email"
      />

      {showPhone && (
        <Input
          name="phone"
          type="tel"
          label="Phone"
          placeholder="+1 (555) 000-0000"
          error={errors.phone}
          autoComplete="tel"
        />
      )}

      {showSubject && (
        <Input
          name="subject"
          label="Subject"
          placeholder="What's this about?"
          error={errors.subject}
        />
      )}

      <Textarea
        name="message"
        label="Message"
        placeholder="How can we help you?"
        required
        rows={4}
        error={errors.message}
      />

      <SubmitButton loading={isSubmitting}>{submitText}</SubmitButton>
    </FormFlow>
  );
}
