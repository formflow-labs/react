/**
 * shadcn/ui Integration Example
 *
 * Shows how useFormFlow works seamlessly with shadcn/ui components.
 * The same pattern works with Material-UI, Chakra UI, or any React component library.
 */

import { useFormFlow } from '@formflow.sh/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ShadcnContactForm() {
  const { register, handleSubmit, formState } = useFormFlow({
    apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
    onSuccess: (data, response) => {
      console.log('Form submitted!', { data, response });
      // You could show a toast notification here
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          {...register('email')}
          id="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          {...register('name')}
          id="name"
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          {...register('message')}
          id="message"
          placeholder="Tell us what you think..."
          rows={4}
          required
        />
      </div>

      <Button type="submit" disabled={formState.isSubmitting} className="w-full">
        {formState.isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
