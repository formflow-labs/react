// Use environment variable if available (Next.js, Vite), fallback to production URL
const FORMFLOW_API_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FORMFLOW_API_URL) ||
  'https://formflow.sh';

export interface SubmitResponse {
  success: boolean;
  message: string;
  submissionId?: string;
  error?: string;
  signupUrl?: string;
}

export async function submitForm(
  data: Record<string, any>,
  apiKey?: string
): Promise<SubmitResponse> {
  // Dev mode - no API key, just log
  if (!apiKey) {
    console.log('[FormFlow Dev Mode] Form submission:', data);
    return {
      success: true,
      message: 'Development mode - submission logged to console',
    };
  }

  try {
    const response = await fetch(`${FORMFLOW_API_URL}/api/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FormFlow-API-Key': apiKey,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Submission failed',
        error: result.error,
        signupUrl: result.signupUrl,
      };
    }

    return {
      success: true,
      message: 'Form submitted successfully',
      submissionId: result.submissionId,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to submit form',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
