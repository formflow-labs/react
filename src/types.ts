// FormFlow TypeScript types

export type Theme = 'minimal' | 'modern' | 'brutalist' | 'glass';

export interface SubmitResponse {
  success: boolean;
  message?: string;
  submissionId?: string;
  signupUrl?: string;
  error?: string;
}

export interface FormFlowProps {
  apiKey?: string;
  onSuccess?: (data: Record<string, any>, response?: SubmitResponse) => void;
  onError?: (error: Error | SubmitResponse) => void;
  theme?: Theme;
  children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export interface TemplateProps {
  apiKey?: string;
  theme?: Theme;
  onSuccess?: (data: Record<string, any>, response?: SubmitResponse) => void;
  onError?: (error: Error | SubmitResponse) => void;
}
