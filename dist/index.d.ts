import { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React$1 from 'react';

interface SubmitResponse$1 {
    success: boolean;
    message: string;
    submissionId?: string;
    error?: string;
    signupUrl?: string;
}
declare function submitForm(data: Record<string, any>, apiKey?: string): Promise<SubmitResponse$1>;

/**
 * Options for configuring useFormFlow hook
 */
interface UseFormFlowOptions<TFieldValues extends FieldValues = FieldValues> extends UseFormProps<TFieldValues> {
    /**
     * FormFlow API key from https://formflow.sh/api-keys
     * @example "pk_live_abc123"
     */
    apiKey?: string;
    /**
     * Called when form submits successfully
     * @param data - The submitted form data
     * @param response - The FormFlow API response
     */
    onSuccess?: (data: TFieldValues, response: SubmitResponse$1) => void;
    /**
     * Called when form submission fails
     * @param error - Error object with details
     */
    onError?: (error: Error | SubmitResponse$1) => void;
}
/**
 * Return value from useFormFlow hook
 * Includes all react-hook-form methods plus handleSubmit configured for FormFlow
 */
type UseFormFlowReturn<TFieldValues extends FieldValues = FieldValues> = Omit<UseFormReturn<TFieldValues>, 'handleSubmit'> & {
    /**
     * Form submission handler that submits to FormFlow backend
     * Works like react-hook-form's handleSubmit but automatically submits to FormFlow
     * @example
     * ```tsx
     * <form onSubmit={handleSubmit}>...</form>
     * ```
     */
    handleSubmit: ReturnType<UseFormReturn<TFieldValues>['handleSubmit']>;
};
/**
 * React hook for building forms that submit to FormFlow backend.
 * Works with any UI library (shadcn/ui, MUI, native HTML).
 *
 * Wraps react-hook-form for validation and state management, adding
 * automatic backend submission to FormFlow API.
 *
 * @example
 * ```tsx
 * import { useFormFlow } from '@formflow.sh/react';
 * import { Input } from '@/components/ui/input';
 * import { Button } from '@/components/ui/button';
 *
 * function ContactForm() {
 *   const { register, handleSubmit, formState } = useFormFlow({
 *     apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
 *     onSuccess: () => alert('Thanks!'),
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <Input {...register('email')} type="email" required />
 *       <Button type="submit" disabled={formState.isSubmitting}>
 *         Submit
 *       </Button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @param options - Configuration for the form
 * @returns Form state and handlers from react-hook-form with handleSubmit configured for FormFlow
 */
declare function useFormFlow<TFieldValues extends FieldValues = FieldValues>(options: UseFormFlowOptions<TFieldValues>): UseFormFlowReturn<TFieldValues>;

type Theme = 'minimal' | 'modern' | 'brutalist' | 'glass';
interface SubmitResponse {
    success: boolean;
    message?: string;
    submissionId?: string;
    signupUrl?: string;
    error?: string;
}
interface FormFlowProps$1 {
    apiKey?: string;
    onSuccess?: (data: Record<string, any>, response?: SubmitResponse) => void;
    onError?: (error: Error | SubmitResponse) => void;
    theme?: Theme;
    children: React.ReactNode;
}
interface InputProps$1 extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}
interface TextareaProps$1 extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}
interface SelectProps$1 {
    label?: string;
    error?: string;
    options: {
        value: string;
        label: string;
    }[];
    value?: string;
    onChange?: (value: string) => void;
}
interface TemplateProps {
    apiKey?: string;
    theme?: Theme;
    onSuccess?: (data: Record<string, any>, response?: SubmitResponse) => void;
    onError?: (error: Error | SubmitResponse) => void;
}

interface FormFlowProps {
    apiKey?: string;
    theme?: Theme;
    className?: string;
    children: React$1.ReactNode;
    onSubmit?: (data: Record<string, any>) => void | Promise<void>;
    onSuccess?: (data: Record<string, any>, response: SubmitResponse$1) => void;
    onError?: (error: Error | SubmitResponse$1) => void;
    showPoweredBy?: boolean;
}
declare function FormFlow({ apiKey, theme, className, children, onSubmit, onSuccess, onError, showPoweredBy, }: FormFlowProps): react_jsx_runtime.JSX.Element;

interface InputProps extends React$1.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
}
declare const Input: React$1.ForwardRefExoticComponent<InputProps & React$1.RefAttributes<HTMLInputElement>>;

interface TextareaProps extends React$1.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    description?: string;
}
declare const Textarea: React$1.ForwardRefExoticComponent<TextareaProps & React$1.RefAttributes<HTMLTextAreaElement>>;

interface SelectOption {
    value: string;
    label: string;
}
interface SelectProps extends Omit<React$1.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    description?: string;
    options: SelectOption[];
    placeholder?: string;
    onChange?: (value: string) => void;
}
declare const Select: React$1.ForwardRefExoticComponent<SelectProps & React$1.RefAttributes<HTMLSelectElement>>;

interface CheckboxProps extends Omit<React$1.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
    description?: string;
}
declare const Checkbox: React$1.ForwardRefExoticComponent<CheckboxProps & React$1.RefAttributes<HTMLInputElement>>;

interface SubmitButtonProps extends React$1.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
}
declare const SubmitButton: React$1.ForwardRefExoticComponent<SubmitButtonProps & React$1.RefAttributes<HTMLButtonElement>>;

interface ContactFormProps {
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
    onError?: (error: Error | SubmitResponse$1) => void;
    /** Form title */
    title?: string;
    /** Form description */
    description?: string;
}
interface ContactFormData {
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
declare function ContactForm({ apiKey, theme, className, showSubject, showPhone, submitText, onSuccess, onError, title, description, }: ContactFormProps): react_jsx_runtime.JSX.Element;

interface NewsletterFormProps {
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
    onError?: (error: Error | SubmitResponse$1) => void;
    /** Form title */
    title?: string;
    /** Form description */
    description?: string;
    /** Inline mode (horizontal layout) */
    inline?: boolean;
}
interface NewsletterFormData {
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
declare function NewsletterForm({ apiKey, mailchimpApiKey, mailchimpListId, theme, className, showName, submitText, onSuccess, onError, title, description, inline, }: NewsletterFormProps): react_jsx_runtime.JSX.Element;

interface FeedbackFormProps {
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
    onError?: (error: Error | SubmitResponse$1) => void;
    /** Form title */
    title?: string;
    /** Form description */
    description?: string;
    /** Question text */
    question?: string;
}
interface FeedbackFormData {
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
declare function FeedbackForm({ apiKey, theme, className, ratingType, showName, showEmail, submitText, onSuccess, onError, title, description, question, }: FeedbackFormProps): react_jsx_runtime.JSX.Element;

interface BookingFormProps {
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
    onError?: (error: Error | SubmitResponse$1) => void;
    /** Form title */
    title?: string;
    /** Form description */
    description?: string;
}
interface BookingFormData {
    name: string;
    email: string;
    phone: string;
    service: string;
    date: string;
    time: string;
    notes?: string;
}
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
declare function BookingForm({ apiKey, theme, className, services, timeSlots, submitText, onSuccess, onError, title, description, }: BookingFormProps): react_jsx_runtime.JSX.Element;

interface SupportTicketFormProps {
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
    onError?: (error: Error | SubmitResponse$1) => void;
    /** Form title */
    title?: string;
    /** Form description */
    description?: string;
}
interface SupportTicketFormData {
    name: string;
    email: string;
    subject: string;
    category: string;
    priority: string;
    description: string;
}
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
declare function SupportTicketForm({ apiKey, theme, className, categories, priorities, submitText, onSuccess, onError, title, description, }: SupportTicketFormProps): react_jsx_runtime.JSX.Element;

interface QuoteRequestFormProps {
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
    onError?: (error: Error | SubmitResponse$1) => void;
    /** Form title */
    title?: string;
    /** Form description */
    description?: string;
}
interface QuoteRequestFormData {
    name: string;
    email: string;
    company: string;
    phone?: string;
    services: string[];
    budget?: string;
    timeline?: string;
    description: string;
}
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
declare function QuoteRequestForm({ apiKey, theme, className, services, budgetRanges, submitText, onSuccess, onError, title, description, }: QuoteRequestFormProps): react_jsx_runtime.JSX.Element;

export { BookingForm, Checkbox, ContactForm, FeedbackForm, FormFlow, type FormFlowProps$1 as FormFlowProps, Input, type InputProps$1 as InputProps, NewsletterForm, QuoteRequestForm, Select, type SelectProps$1 as SelectProps, SubmitButton, type SubmitResponse$1 as SubmitResponse, SupportTicketForm, type TemplateProps, Textarea, type TextareaProps$1 as TextareaProps, type Theme, type UseFormFlowOptions, type UseFormFlowReturn, submitForm, useFormFlow };
