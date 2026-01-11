export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateField(
  value: string,
  rules: ValidationRule
): ValidationResult {
  if (rules.required && !value?.trim()) {
    return { valid: false, message: rules.message || 'This field is required' };
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    return {
      valid: false,
      message: rules.message || `Minimum ${rules.minLength} characters required`,
    };
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return {
      valid: false,
      message: rules.message || `Maximum ${rules.maxLength} characters allowed`,
    };
  }

  if (rules.email && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, message: rules.message || 'Invalid email address' };
    }
  }

  if (rules.pattern && value && !rules.pattern.test(value)) {
    return { valid: false, message: rules.message || 'Invalid format' };
  }

  return { valid: true };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-+()]{10,}$/;
  return phoneRegex.test(phone);
}
