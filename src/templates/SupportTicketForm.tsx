import * as React from 'react';
import { FormFlow, useFormFlowApiKey } from '../components/FormFlow';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { SubmitButton } from '../components/SubmitButton';
import { validateEmail } from '../utils/validation';
import type { Theme } from '../types';
import type { SubmitResponse } from '../utils/api';

export interface SupportTicketFormProps {
  /** FormFlow API key. Optional in dev mode. */
  apiKey?: string;
  /** Theme style: minimal, modern, brutalist, or glass */
  theme?: Theme;
  /** Custom class name */
  className?: string;
  /** Issue categories */
  categories?: string[];
  /** Priority levels */
  priorities?: string[];
  /** Submit button text */
  submitText?: string;
  /** Success callback */
  onSuccess?: (data: SupportTicketFormData) => void;
  /** Error callback */
  onError?: (error: Error | SubmitResponse) => void;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
}

export interface SupportTicketFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
}

const DEFAULT_CATEGORIES = [
  'Technical Issue',
  'Billing Question',
  'Feature Request',
  'Account Issue',
  'General Inquiry',
  'Other',
];

const DEFAULT_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

/**
 * SupportTicketForm - Create support tickets with category and priority.
 *
 * @example
 * // Basic usage with default categories
 * <SupportTicketForm />
 *
 * @example
 * // Custom categories
 * <SupportTicketForm
 *   categories={['Bug Report', 'Feature Request', 'Question']}
 *   title="Get help"
 *   description="We typically respond within 24 hours"
 * />
 */
export function SupportTicketForm({
  apiKey,
  theme = 'minimal',
  className,
  categories = DEFAULT_CATEGORIES,
  priorities = DEFAULT_PRIORITIES,
  submitText = 'Submit ticket',
  onSuccess,
  onError,
  title = 'Submit a support ticket',
  description,
}: SupportTicketFormProps) {
  const globalApiKey = useFormFlowApiKey();
  const effectiveApiKey = apiKey || globalApiKey || undefined;

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const categoryOptions = categories.map((c) => ({ value: c, label: c }));
  const priorityOptions = priorities.map((p) => ({ value: p, label: p }));

  const validateForm = (data: SupportTicketFormData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.subject?.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (data.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!data.category) {
      newErrors.category = 'Please select a category';
    }

    if (!data.priority) {
      newErrors.priority = 'Please select a priority';
    }

    if (!data.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (data.description.trim().length < 20) {
      newErrors.description = 'Please provide more details (at least 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: Record<string, any>) => {
    const formData = data as SupportTicketFormData;

    if (!validateForm(formData)) {
      throw new Error('Validation failed');
    }

    setIsSubmitting(true);
  };

  const handleSuccess = (data: Record<string, any>) => {
    setIsSubmitting(false);
    setErrors({});
    onSuccess?.(data as SupportTicketFormData);
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

      <Input
        name="subject"
        label="Subject"
        placeholder="Brief description of the issue"
        required
        error={errors.subject}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          name="category"
          label="Category"
          options={categoryOptions}
          placeholder="Select category"
          required
          error={errors.category}
        />

        <Select
          name="priority"
          label="Priority"
          options={priorityOptions}
          placeholder="Select priority"
          required
          error={errors.priority}
        />
      </div>

      <Textarea
        name="description"
        label="Description"
        placeholder="Please describe your issue in detail..."
        required
        rows={5}
        error={errors.description}
      />

      <SubmitButton loading={isSubmitting}>{submitText}</SubmitButton>
    </FormFlow>
  );
}
