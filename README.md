# @formflow.sh/react

Production-grade React form hook with built-in backend submission. No server code needed.

## Installation

```bash
npm install @formflow.sh/react
# or
pnpm add @formflow.sh/react
# or
yarn add @formflow.sh/react
```

## Quick Start

```tsx
import { useFormFlow } from '@formflow.sh/react';
import { Input } from '@/components/ui/input'; // any UI library
import { Button } from '@/components/ui/button';

export function ContactForm() {
  const { register, handleSubmit, formState } = useFormFlow({
    apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
    onSuccess: () => alert('Thanks for your message!'),
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input {...register('email')} type="email" required />
      <Input {...register('name')} required />
      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Sending...' : 'Submit'}
      </Button>
    </form>
  );
}
```

That's it! Your form submits to FormFlow's backend automatically. No API routes, no server code.

## Why useFormFlow?

- **Works with ANY UI library**: shadcn/ui, Material-UI, Chakra UI, or native HTML
- **Built on react-hook-form**: Battle-tested validation and state management (41k stars)
- **Backend included**: Form submission, storage, and email notifications handled automatically
- **TypeScript-first**: Excellent IntelliSense and type safety
- **Production-ready**: Comprehensive test coverage, industry-standard patterns

## API Reference

### `useFormFlow(options)`

React hook for form state management and backend submission.

#### Options

All options from [react-hook-form](https://react-hook-form.com/docs/useform) are supported, plus:

- **`apiKey`** (string, required): FormFlow API key from [dashboard](https://formflow.sh/api-keys)
  ```tsx
  apiKey: 'pk_live_abc123'
  ```

- **`onSuccess`** (function, optional): Called after successful submission
  ```tsx
  onSuccess: (data, response) => {
    console.log('Submitted:', data);
    console.log('Submission ID:', response.submissionId);
  }
  ```

- **`onError`** (function, optional): Called when submission fails
  ```tsx
  onError: (error) => {
    console.error('Error:', error.message);
  }
  ```

- **`defaultValues`** (object, optional): Initial form values
  ```tsx
  defaultValues: {
    email: 'user@example.com',
    newsletter: true
  }
  ```

#### Returns

All methods from [react-hook-form](https://react-hook-form.com/docs/useform) are available, including:

- **`register(name, options)`**: Register form field
  ```tsx
  <input {...register('email', { required: true })} />
  ```

- **`handleSubmit`**: Form submission handler (enhanced to submit to FormFlow)
  ```tsx
  <form onSubmit={handleSubmit}>...</form>
  ```

- **`formState`**: Current form state
  ```tsx
  formState.isSubmitting // true while submitting
  formState.errors // validation errors
  formState.isValid // form validity
  ```

- **`setValue(name, value)`**: Programmatically set field value
  ```tsx
  setValue('email', 'new@example.com')
  ```

- **`getValues()`**: Get all current values
  ```tsx
  const values = getValues()
  ```

- **`reset()`**: Reset form to defaults
  ```tsx
  reset()
  ```

- **`watch(name)`**: Watch field value for conditional logic
  ```tsx
  const newsletter = watch('newsletter')
  ```

## Works With Any UI Library

### shadcn/ui

```tsx
import { useFormFlow } from '@formflow.sh/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const { register, handleSubmit, formState } = useFormFlow({
  apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY
});

<div>
  <Label htmlFor="email">Email</Label>
  <Input {...register('email')} id="email" type="email" required />
</div>
```

### Material-UI

```tsx
import { useFormFlow } from '@formflow.sh/react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const { register, handleSubmit } = useFormFlow({
  apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY
});

<TextField {...register('email')} type="email" label="Email" required />
<Button type="submit">Submit</Button>
```

### Chakra UI

```tsx
import { useFormFlow } from '@formflow.sh/react';
import { Input, Button } from '@chakra-ui/react';

const { register, handleSubmit } = useFormFlow({
  apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY
});

<Input {...register('email')} type="email" placeholder="Email" />
<Button type="submit">Submit</Button>
```

### Native HTML

```tsx
import { useFormFlow } from '@formflow.sh/react';

const { register, handleSubmit, formState } = useFormFlow({
  apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY
});

<form onSubmit={handleSubmit}>
  <input {...register('email')} type="email" required />
  <button type="submit" disabled={formState.isSubmitting}>
    Submit
  </button>
</form>
```

## Form Validation

FormFlow uses react-hook-form's validation, which is both powerful and flexible.

### Basic Validation

```tsx
<input
  {...register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  })}
  type="email"
/>
{formState.errors.email && (
  <span className="error">{formState.errors.email.message}</span>
)}
```

### Advanced Validation

```tsx
<input
  {...register('password', {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters'
    },
    validate: {
      hasUpperCase: (value) =>
        /[A-Z]/.test(value) || 'Password must contain an uppercase letter',
      hasLowerCase: (value) =>
        /[a-z]/.test(value) || 'Password must contain a lowercase letter',
      hasNumber: (value) =>
        /\d/.test(value) || 'Password must contain a number'
    }
  })}
  type="password"
/>
```

### Common Validation Rules

- **`required`**: Field is required
- **`pattern`**: Regex pattern matching
- **`minLength`** / **`maxLength`**: String length validation
- **`min`** / **`max`**: Number range validation
- **`validate`**: Custom validation functions

See [react-hook-form validation docs](https://react-hook-form.com/docs/useform/register#options) for all options.

## Examples

See the [`/examples`](./examples) directory for complete working examples:

### 1. [Basic Form](./examples/basic-form.tsx)

Simplest possible implementation using native HTML elements.

**Features:** Native HTML inputs, basic error handling, loading states

**When to use:** Quick prototypes, simple forms, learning the basics

### 2. [shadcn/ui Integration](./examples/shadcn-form.tsx)

Shows integration with shadcn/ui component library.

**Features:** shadcn/ui Input, Button, Label, Textarea components

**When to use:** Production apps using shadcn/ui, modern design systems

### 3. [Form Validation](./examples/validation-form.tsx)

Comprehensive validation patterns using react-hook-form.

**Features:** Required fields, email patterns, min/max length, number ranges, custom validation

**When to use:** Forms requiring data validation, user input safety

### 4. [Advanced Features](./examples/advanced-form.tsx)

Advanced patterns for production applications.

**Features:** Default values, error handling, controlled components with `watch()`, conditional fields, form reset

**When to use:** Complex forms, production applications, advanced requirements

## Live Examples

Visit [formflow.sh/docs/examples](https://formflow.sh/docs/examples) for interactive demos you can test in your browser.

## Common Patterns

### Newsletter Signup

```tsx
const { register, handleSubmit, formState } = useFormFlow({
  apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
  onSuccess: () => alert('Subscribed!'),
});

return (
  <form onSubmit={handleSubmit} className="flex gap-2">
    <input {...register('email')} type="email" required />
    <button type="submit" disabled={formState.isSubmitting}>
      Subscribe
    </button>
  </form>
);
```

### Contact Form with Toast

```tsx
import { toast } from 'sonner'; // or your toast library

const { register, handleSubmit } = useFormFlow({
  apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
  onSuccess: () => toast.success('Message sent!'),
  onError: () => toast.error('Failed to send message'),
});
```

### Multi-Step Form

```tsx
const [step, setStep] = useState(1);
const { register, handleSubmit, trigger } = useFormFlow({
  apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
});

const handleNext = async () => {
  const isValid = await trigger(['email', 'name']); // Validate current step
  if (isValid) setStep(2);
};
```

## Error Handling

FormFlow provides detailed error information for different failure scenarios:

```tsx
const { register, handleSubmit } = useFormFlow({
  apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
  onError: (error) => {
    if (error.message?.includes('401')) {
      alert('Invalid API key');
    } else if (error.message?.includes('402')) {
      alert('Submission quota exceeded. Please upgrade your plan.');
    } else if (error.message?.includes('429')) {
      alert('Too many requests. Please try again in a few minutes.');
    } else if (error.message?.includes('Network')) {
      alert('Network error. Please check your internet connection.');
    } else {
      alert('An unexpected error occurred. Please try again.');
    }
  },
});
```

## Development Mode

All forms work without an API key during development. Submissions are logged to the console:

```tsx
const { register, handleSubmit } = useFormFlow({
  apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY, // undefined in dev = console logs
});
```

To test with a real backend:
1. Sign up at [formflow.sh](https://formflow.sh)
2. Get your API key from the dashboard
3. Add it to your `.env` file:
   ```env
   NEXT_PUBLIC_FORMFLOW_API_KEY=pk_live_xxx
   ```

## Environment Variables

### Next.js

```env
NEXT_PUBLIC_FORMFLOW_API_KEY=your_api_key_here
```

### Vite

```env
VITE_FORMFLOW_API_KEY=your_api_key_here
```

Update your code:
```tsx
apiKey: import.meta.env.VITE_FORMFLOW_API_KEY
```

### Create React App

```env
REACT_APP_FORMFLOW_API_KEY=your_api_key_here
```

Update your code:
```tsx
apiKey: process.env.REACT_APP_FORMFLOW_API_KEY
```

## TypeScript

Fully typed with excellent IntelliSense support:

```typescript
import type {
  UseFormFlowOptions,
  UseFormFlowReturn,
  FormFlowSubmitResponse,
  FormFlowError
} from '@formflow.sh/react';

// Type your form data
interface ContactFormData {
  email: string;
  name: string;
  message: string;
}

const { register, handleSubmit } = useFormFlow<ContactFormData>({
  apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
  onSuccess: (data, response) => {
    // data is typed as ContactFormData
    console.log(data.email);
    console.log(response.submissionId);
  },
});
```

## Migration from Wrapper Components

If you're using the old wrapper-based components (`<FormFlow>`, `<ContactForm>`), they still work but are deprecated. Migrate to the hook-based API:

**Before:**
```tsx
import { ContactForm } from '@formflow.sh/react';

<ContactForm apiKey="pk_live_xxx" theme="minimal" />
```

**After:**
```tsx
import { useFormFlow } from '@formflow.sh/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ContactForm() {
  const { register, handleSubmit, formState } = useFormFlow({
    apiKey: process.env.NEXT_PUBLIC_FORMFLOW_API_KEY,
  });

  return (
    <form onSubmit={handleSubmit}>
      <Input {...register('email')} type="email" required />
      <Input {...register('name')} required />
      <Button type="submit" disabled={formState.isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

Benefits:
- Works with your existing component library
- More flexible and customizable
- Industry-standard pattern
- Better TypeScript support

## Troubleshooting

### "Cannot find module '@formflow.sh/react'"

Make sure you've installed the package:
```bash
npm install @formflow.sh/react
```

### "API key invalid" error

Check that your API key is correctly set in your `.env` file and starts with `pk_live_` or `pk_test_`.

### Form not submitting

1. Check browser console for errors
2. Verify `handleSubmit` is passed to `onSubmit` prop
3. Ensure form has a submit button with `type="submit"`
4. Confirm API key is set (or remove it for dev mode)

### TypeScript errors

Ensure you have the latest version:
```bash
npm install @formflow.sh/react@latest
```

### Validation not working

react-hook-form validation is client-side only. Make sure to:
1. Pass validation options to `register()`
2. Display errors from `formState.errors`
3. Check `formState.isValid` before allowing submission

## Contributing

Found a useful pattern? Submit a PR with a new example in the `/examples` directory!

## Learn More

- [Full Documentation](https://formflow.sh/docs)
- [Live Examples](https://formflow.sh/docs/examples)
- [API Reference](https://formflow.sh/docs/api)
- [react-hook-form Docs](https://react-hook-form.com/docs)
- [TypeScript Types](./src/hooks/useFormFlow.ts)

## Pricing

- **Free**: 50 submissions/month
- **Maker**: $9/month - 1,000 submissions
- **Pro**: $29/month - 10,000 submissions
- **Business**: $99/month - 100,000 submissions

See [formflow.sh/pricing](https://formflow.sh/pricing) for details.

## License

MIT
