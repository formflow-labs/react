import * as React from 'react';
import { FormFlow, useFormFlowApiKey } from '../components/FormFlow';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { Checkbox } from '../components/Checkbox';
import { SubmitButton } from '../components/SubmitButton';
import { validateEmail } from '../utils/validation';
import { cn } from '../utils/cn';
import type { Theme } from '../types';
import type { SubmitResponse } from '../utils/api';

export interface QuoteRequestFormProps {
  /** FormFlow API key. Optional in dev mode. */
  apiKey?: string;
  /** Theme style: minimal, modern, brutalist, or glass */
  theme?: Theme;
  /** Custom class name */
  className?: string;
  /** Available services for quotes */
  services: string[];
  /** Budget ranges */
  budgetRanges?: string[];
  /** Submit button text */
  submitText?: string;
  /** Success callback */
  onSuccess?: (data: QuoteRequestFormData) => void;
  /** Error callback */
  onError?: (error: Error | SubmitResponse) => void;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
}

export interface QuoteRequestFormData {
  name: string;
  email: string;
  company: string;
  phone?: string;
  services: string[];
  budget?: string;
  timeline?: string;
  description: string;
}

const DEFAULT_BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000+',
];

const DEFAULT_TIMELINES = [
  'ASAP',
  '1-2 weeks',
  '1 month',
  '1-3 months',
  '3+ months',
  'Flexible',
];

/**
 * QuoteRequestForm - Request quotes with service selection and budget.
 *
 * @example
 * // Basic usage
 * <QuoteRequestForm services={['Web Design', 'Mobile App', 'Consulting']} />
 *
 * @example
 * // Full configuration
 * <QuoteRequestForm
 *   services={['Branding', 'Website', 'Marketing']}
 *   budgetRanges={['$5k-$10k', '$10k-$25k', '$25k+']}
 *   title="Get a free quote"
 *   description="Tell us about your project"
 * />
 */
export function QuoteRequestForm({
  apiKey,
  theme = 'minimal',
  className,
  services,
  budgetRanges = DEFAULT_BUDGET_RANGES,
  submitText = 'Request quote',
  onSuccess,
  onError,
  title = 'Request a quote',
  description,
}: QuoteRequestFormProps) {
  const globalApiKey = useFormFlowApiKey();
  const effectiveApiKey = apiKey || globalApiKey || undefined;

  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const budgetOptions = budgetRanges.map((b) => ({ value: b, label: b }));
  const timelineOptions = DEFAULT_TIMELINES.map((t) => ({ value: t, label: t }));

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const validateForm = (data: QuoteRequestFormData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.company?.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (selectedServices.length === 0) {
      newErrors.services = 'Please select at least one service';
    }

    if (!data.description?.trim()) {
      newErrors.description = 'Please describe your project';
    } else if (data.description.trim().length < 20) {
      newErrors.description = 'Please provide more details (at least 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: Record<string, any>) => {
    data.services = selectedServices;
    const formData = data as QuoteRequestFormData;

    if (!validateForm(formData)) {
      throw new Error('Validation failed');
    }

    setIsSubmitting(true);
  };

  const handleSuccess = (data: Record<string, any>) => {
    setIsSubmitting(false);
    setSelectedServices([]);
    setErrors({});
    onSuccess?.(data as QuoteRequestFormData);
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
        label="Your name"
        placeholder="John Smith"
        required
        error={errors.name}
        autoComplete="name"
      />

      <Input
        name="email"
        type="email"
        label="Work email"
        placeholder="john@company.com"
        required
        error={errors.email}
        autoComplete="email"
      />

      <Input
        name="company"
        label="Company"
        placeholder="Your company name"
        required
        error={errors.company}
        autoComplete="organization"
      />

      <Input
        name="phone"
        type="tel"
        label="Phone (optional)"
        placeholder="+1 (555) 000-0000"
        autoComplete="tel"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Services interested in <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {services.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => handleServiceToggle(service)}
              className={cn(
                'px-3 py-2 text-sm rounded-md border transition-colors text-left',
                selectedServices.includes(service)
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
              )}
            >
              {service}
            </button>
          ))}
        </div>
        {errors.services && (
          <p className="text-sm text-red-500">{errors.services}</p>
        )}
        <input
          type="hidden"
          name="services"
          value={selectedServices.join(', ')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          name="budget"
          label="Budget range"
          options={budgetOptions}
          placeholder="Select budget"
        />

        <Select
          name="timeline"
          label="Timeline"
          options={timelineOptions}
          placeholder="Select timeline"
        />
      </div>

      <Textarea
        name="description"
        label="Project description"
        placeholder="Tell us about your project, goals, and any specific requirements..."
        required
        rows={4}
        error={errors.description}
      />

      <SubmitButton loading={isSubmitting}>{submitText}</SubmitButton>
    </FormFlow>
  );
}
