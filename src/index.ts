// FormFlow React - Beautiful forms with backend included
// Main exports

// Core hook (primary export - production-grade)
export { useFormFlow } from './hooks/useFormFlow';
export type { UseFormFlowOptions, UseFormFlowReturn } from './hooks/useFormFlow';

// Legacy wrapper components (for backward compatibility)
export { FormFlow } from './components/FormFlow';
export { Input } from './components/Input';
export { Textarea } from './components/Textarea';
export { Select } from './components/Select';
export { Checkbox } from './components/Checkbox';
export { SubmitButton } from './components/SubmitButton';

// Templates (optional, for backward compatibility)
export { ContactForm } from './templates/ContactForm';
export { NewsletterForm } from './templates/NewsletterForm';
export { FeedbackForm } from './templates/FeedbackForm';
export { BookingForm } from './templates/BookingForm';
export { SupportTicketForm } from './templates/SupportTicketForm';
export { QuoteRequestForm } from './templates/QuoteRequestForm';

// Utilities
export { submitForm } from './utils/api';
export type { SubmitResponse } from './utils/api';

// Types
export type * from './types';
