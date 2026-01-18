# FormFlow Examples

This directory contains comprehensive examples demonstrating how to use the `useFormFlow` hook in various scenarios.

## Examples

### 1. Basic Form (`basic-form.tsx`)

The simplest possible implementation using native HTML elements.

**Features:**
- Native HTML inputs
- Basic error handling
- Loading states

**When to use:** Quick prototypes, simple forms, learning the basics

### 2. shadcn/ui Integration (`shadcn-form.tsx`)

Shows integration with shadcn/ui component library.

**Features:**
- shadcn/ui Input, Button, Label, Textarea components
- Clean, modern UI
- Type-safe component props

**When to use:** Production apps using shadcn/ui, modern design systems

**Note:** The same pattern works with:
- Material-UI: `<TextField {...register('email')} />`
- Chakra UI: `<Input {...register('email')} />`
- Any React component library that accepts `ref` and standard input props

### 3. Form Validation (`validation-form.tsx`)

Comprehensive validation patterns using react-hook-form.

**Features:**
- Required field validation
- Email pattern matching
- Min/max length validation
- Number range validation
- Custom validation functions
- User-friendly error messages

**When to use:** Forms requiring data validation, user input safety

### 4. Advanced Features (`advanced-form.tsx`)

Advanced patterns for production applications.

**Features:**
- Default values
- Error handling with user-friendly messages
- Controlled components with `watch()`
- Conditional fields
- Form reset
- Form state indicators

**When to use:** Complex forms, production applications, advanced requirements

## Running the Examples

### With Next.js

1. Copy the example into your Next.js project
2. Set your API key in `.env.local`:
   ```env
   NEXT_PUBLIC_FORMFLOW_API_KEY=your_api_key_here
   ```
3. Import and use the component:
   ```tsx
   import { BasicContactForm } from './examples/basic-form';

   export default function Page() {
     return <BasicContactForm />;
   }
   ```

### With Vite

1. Copy the example into your Vite project
2. Set your API key in `.env`:
   ```env
   VITE_FORMFLOW_API_KEY=your_api_key_here
   ```
3. Update the example to use `import.meta.env.VITE_FORMFLOW_API_KEY`

### With Create React App

1. Copy the example into your CRA project
2. Set your API key in `.env`:
   ```env
   REACT_APP_FORMFLOW_API_KEY=your_api_key_here
   ```
3. Update the example to use `process.env.REACT_APP_FORMFLOW_API_KEY`

## Development Mode

All examples work without an API key during development. Submissions are logged to the console.

To test with a real backend:
1. Sign up at [formflow.sh](https://formflow.sh)
2. Get your API key from the dashboard
3. Add it to your `.env` file

## Learn More

- [Full Documentation](https://formflow.sh/docs)
- [Live Examples](https://formflow.sh/docs/examples)
- [API Reference](https://formflow.sh/docs/api)
- [TypeScript Types](../src/hooks/useFormFlow.ts)

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

### TypeScript errors

Ensure you have the latest version:
```bash
npm install @formflow.sh/react@latest
```

## Contributing

Found a useful pattern? Submit a PR with a new example!
