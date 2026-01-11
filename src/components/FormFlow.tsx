import * as React from 'react';
import { cn } from '../utils/cn';
import { submitForm, SubmitResponse } from '../utils/api';
import type { Theme } from '../types';

interface FormFlowContextValue {
  apiKey?: string;
  isSubmitting: boolean;
  formData: Record<string, any>;
  errors: Record<string, string>;
  setFieldValue: (name: string, value: any) => void;
  setFieldError: (name: string, error: string) => void;
  clearFieldError: (name: string) => void;
}

const FormFlowContext = React.createContext<FormFlowContextValue | null>(null);

export function useFormFlow() {
  const context = React.useContext(FormFlowContext);
  if (!context) {
    throw new Error('useFormFlow must be used within a FormFlow component');
  }
  return context;
}

export interface FormFlowProps {
  apiKey?: string;
  theme?: Theme;
  className?: string;
  children: React.ReactNode;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  onSuccess?: (data: Record<string, any>, response: SubmitResponse) => void;
  onError?: (error: Error | SubmitResponse) => void;
  showPoweredBy?: boolean;
}

const themeStyles: Record<Theme, string> = {
  minimal: 'bg-white p-6 rounded-lg shadow-sm border border-gray-100',
  modern:
    'bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100',
  brutalist:
    'bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
  glass:
    'bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20',
};

export function FormFlow({
  apiKey,
  theme = 'minimal',
  className,
  children,
  onSubmit,
  onSuccess,
  onError,
  showPoweredBy = !apiKey,
}: FormFlowProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = React.useState(false);

  const setFieldValue = React.useCallback((name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = React.useCallback((name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const clearFieldError = React.useCallback((name: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Collect form data from the form element
    const form = e.currentTarget;
    const formDataObj = new FormData(form);
    const data: Record<string, any> = {};

    formDataObj.forEach((value, key) => {
      if (data[key]) {
        // Handle multiple values (e.g., checkboxes)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    try {
      // Custom onSubmit handler
      if (onSubmit) {
        await onSubmit(data);
      }

      // Submit to FormFlow API
      const response = await submitForm(data, apiKey);

      if (response.success) {
        setShowSuccessModal(true);
        onSuccess?.(data, response);
        form.reset();
      } else if (response.signupUrl) {
        // No API key - show signup prompt
        setShowSignupPrompt(true);
      } else {
        onError?.(response);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue: FormFlowContextValue = {
    apiKey,
    isSubmitting,
    formData,
    errors,
    setFieldValue,
    setFieldError,
    clearFieldError,
  };

  return (
    <FormFlowContext.Provider value={contextValue}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          'formflow-form w-full max-w-md mx-auto space-y-4',
          themeStyles[theme],
          className
        )}
      >
        {children}

        {showPoweredBy && (
          <div className="text-center pt-4 border-t border-gray-100 mt-6">
            <a
              href="https://formflow.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Powered by FormFlow
            </a>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
              <p className="text-gray-600 mb-4">
                Your submission has been received.
              </p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Signup Prompt (for dev mode) */}
        {showSignupPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Your form is working!
              </h3>
              <p className="text-gray-600 mb-4">
                Sign up at formflow.sh to start receiving submissions.
              </p>
              <div className="space-y-2">
                <a
                  href="https://formflow.sh/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Sign up now
                </a>
                <button
                  type="button"
                  onClick={() => setShowSignupPrompt(false)}
                  className="block w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Remind me later
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </FormFlowContext.Provider>
  );
}

// Provider for global API key
interface FormFlowProviderProps {
  apiKey: string;
  children: React.ReactNode;
}

const FormFlowAPIKeyContext = React.createContext<string | null>(null);

export function FormFlowProvider({ apiKey, children }: FormFlowProviderProps) {
  return (
    <FormFlowAPIKeyContext.Provider value={apiKey}>
      {children}
    </FormFlowAPIKeyContext.Provider>
  );
}

export function useFormFlowApiKey() {
  return React.useContext(FormFlowAPIKeyContext);
}
