# @formflow.sh/react

Beautiful React forms with backend included. Zero configuration, works instantly.

## Installation

```bash
npm install @formflow.sh/react
```

## Quick Start

```tsx
import { ContactForm } from '@formflow.sh/react';

function App() {
  return <ContactForm apiKey="your-api-key" />;
}
```

Forms work instantly in development without an API key. Get your key at [formflow.sh](https://formflow.sh) to receive submissions.

## Available Templates

### ContactForm
```tsx
import { ContactForm } from '@formflow.sh/react';

<ContactForm
  apiKey="ff_live_xxx"
  onSuccess={(data) => console.log('Submitted:', data)}
  theme="minimal" // minimal | modern | brutalist | glass
/>
```

### NewsletterForm
```tsx
import { NewsletterForm } from '@formflow.sh/react';

<NewsletterForm
  apiKey="ff_live_xxx"
  showNameField={true}
  buttonText="Subscribe"
/>
```

### FeedbackForm
```tsx
import { FeedbackForm } from '@formflow.sh/react';

<FeedbackForm
  apiKey="ff_live_xxx"
  ratingType="stars" // stars | nps
  maxRating={5}
/>
```

### BookingForm
```tsx
import { BookingForm } from '@formflow.sh/react';

<BookingForm
  apiKey="ff_live_xxx"
  services={['Consultation', 'Training', 'Support']}
  timeSlots={['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM']}
/>
```

### SupportTicketForm
```tsx
import { SupportTicketForm } from '@formflow.sh/react';

<SupportTicketForm
  apiKey="ff_live_xxx"
  categories={['Bug', 'Feature Request', 'Question']}
  priorities={['Low', 'Medium', 'High', 'Urgent']}
/>
```

### QuoteRequestForm
```tsx
import { QuoteRequestForm } from '@formflow.sh/react';

<QuoteRequestForm
  apiKey="ff_live_xxx"
  services={['Web Development', 'Mobile App', 'Consulting']}
  budgetRanges={['$1k-5k', '$5k-10k', '$10k-25k', '$25k+']}
/>
```

## Custom Forms

Build custom forms using the core components:

```tsx
import { FormFlow, Input, Textarea, Select, SubmitButton } from '@formflow.sh/react';

<FormFlow apiKey="ff_live_xxx" onSuccess={(data) => console.log(data)}>
  <Input name="email" type="email" label="Email" required />
  <Select name="plan" label="Plan" options={['Free', 'Pro', 'Enterprise']} />
  <Textarea name="message" label="Message" />
  <SubmitButton>Send</SubmitButton>
</FormFlow>
```

## Props

### Common Props (all templates)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | - | Your FormFlow API key |
| `theme` | `'minimal' \| 'modern' \| 'brutalist' \| 'glass'` | `'minimal'` | Visual theme |
| `onSuccess` | `(data) => void` | - | Called after successful submission |
| `onError` | `(error) => void` | - | Called on submission error |
| `className` | `string` | - | Additional CSS classes |

### FormFlow Props

| Prop | Type | Description |
|------|------|-------------|
| `formId` | `string` | Optional form ID for analytics |
| `successMessage` | `string` | Custom success message |
| `redirectUrl` | `string` | Redirect after submission |

## Themes

```tsx
// Minimal (default) - Clean, subtle shadows
<ContactForm theme="minimal" />

// Modern - Rounded corners, gradient accents
<ContactForm theme="modern" />

// Brutalist - Bold borders, high contrast
<ContactForm theme="brutalist" />

// Glass - Frosted glass effect, blur
<ContactForm theme="glass" />
```

## TypeScript

Full TypeScript support included:

```tsx
import type { FormFlowProps, ContactFormProps } from '@formflow.sh/react';
```

## Pricing

- **Free**: 50 submissions/month
- **Maker**: $9/month - 1,000 submissions
- **Pro**: $29/month - 10,000 submissions
- **Business**: $99/month - 100,000 submissions

## Links

- [Dashboard](https://formflow.sh/dashboard)
- [Documentation](https://formflow.sh/docs)
- [Pricing](https://formflow.sh/pricing)
