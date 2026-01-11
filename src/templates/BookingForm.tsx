import * as React from 'react';
import { FormFlow, useFormFlowApiKey } from '../components/FormFlow';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { SubmitButton } from '../components/SubmitButton';
import { validateEmail, validatePhone } from '../utils/validation';
import type { Theme } from '../types';
import type { SubmitResponse } from '../utils/api';

export interface BookingFormProps {
  /** FormFlow API key. Optional in dev mode. */
  apiKey?: string;
  /** Theme style: minimal, modern, brutalist, or glass */
  theme?: Theme;
  /** Custom class name */
  className?: string;
  /** Available services to book */
  services: string[];
  /** Available time slots */
  timeSlots?: string[];
  /** Submit button text */
  submitText?: string;
  /** Success callback */
  onSuccess?: (data: BookingFormData) => void;
  /** Error callback */
  onError?: (error: Error | SubmitResponse) => void;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}

const DEFAULT_TIME_SLOTS = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
];

/**
 * BookingForm - Schedule appointments with service selection and date/time picker.
 *
 * @example
 * // Basic usage
 * <BookingForm services={['Consultation', 'Demo', 'Training']} />
 *
 * @example
 * // With custom time slots
 * <BookingForm
 *   services={['Haircut', 'Coloring', 'Styling']}
 *   timeSlots={['9:00 AM', '11:00 AM', '2:00 PM']}
 *   title="Book an appointment"
 * />
 */
export function BookingForm({
  apiKey,
  theme = 'minimal',
  className,
  services,
  timeSlots = DEFAULT_TIME_SLOTS,
  submitText = 'Book appointment',
  onSuccess,
  onError,
  title = 'Book an appointment',
  description,
}: BookingFormProps) {
  const globalApiKey = useFormFlowApiKey();
  const effectiveApiKey = apiKey || globalApiKey || undefined;

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const serviceOptions = services.map((s) => ({ value: s, label: s }));
  const timeOptions = timeSlots.map((t) => ({ value: t, label: t }));

  const validateForm = (data: BookingFormData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!data.service) {
      newErrors.service = 'Please select a service';
    }

    if (!data.date) {
      newErrors.date = 'Please select a date';
    }

    if (!data.time) {
      newErrors.time = 'Please select a time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: Record<string, any>) => {
    const formData = data as BookingFormData;

    if (!validateForm(formData)) {
      throw new Error('Validation failed');
    }

    setIsSubmitting(true);
  };

  const handleSuccess = (data: Record<string, any>) => {
    setIsSubmitting(false);
    setErrors({});
    onSuccess?.(data as BookingFormData);
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
        label="Full name"
        placeholder="Your full name"
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
        name="phone"
        type="tel"
        label="Phone number"
        placeholder="+1 (555) 000-0000"
        required
        error={errors.phone}
        autoComplete="tel"
      />

      <Select
        name="service"
        label="Service"
        options={serviceOptions}
        placeholder="Select a service"
        required
        error={errors.service}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="date"
          type="date"
          label="Date"
          required
          min={minDate}
          error={errors.date}
        />

        <Select
          name="time"
          label="Time"
          options={timeOptions}
          placeholder="Select time"
          required
          error={errors.time}
        />
      </div>

      <Textarea
        name="notes"
        label="Additional notes"
        placeholder="Any special requests or information..."
        rows={3}
      />

      <SubmitButton loading={isSubmitting}>{submitText}</SubmitButton>
    </FormFlow>
  );
}
