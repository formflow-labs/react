import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { submitForm, SubmitResponse } from '../utils/api';

/**
 * Options for configuring useFormFlow hook
 */
export interface UseFormFlowOptions<TFieldValues extends FieldValues = FieldValues>
  extends UseFormProps<TFieldValues> {
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
  onSuccess?: (data: TFieldValues, response: SubmitResponse) => void;

  /**
   * Called when form submission fails
   * @param error - Error object with details
   */
  onError?: (error: Error | SubmitResponse) => void;
}

/**
 * Return value from useFormFlow hook
 * Includes all react-hook-form methods plus handleSubmit configured for FormFlow
 */
export type UseFormFlowReturn<TFieldValues extends FieldValues = FieldValues> = Omit<
  UseFormReturn<TFieldValues>,
  'handleSubmit'
> & {
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
export function useFormFlow<TFieldValues extends FieldValues = FieldValues>(
  options: UseFormFlowOptions<TFieldValues>
): UseFormFlowReturn<TFieldValues> {
  const { apiKey, onSuccess, onError, ...formOptions } = options;

  // Leverage react-hook-form for state management and validation
  const form = useForm<TFieldValues>(formOptions);

  // Wrap react-hook-form's handleSubmit to automatically submit to FormFlow
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // Submit to FormFlow backend (client-side validation already done by react-hook-form)
      const result = await submitForm(data as Record<string, any>, apiKey);

      if (result.success) {
        onSuccess?.(data, result);
        form.reset(); // Reset form on success
      } else {
        // Handle FormFlow API errors
        onError?.(result);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  });

  return {
    ...form,
    handleSubmit,
  };
}
