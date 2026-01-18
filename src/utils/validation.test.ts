import { describe, it, expect } from 'vitest';
import { validateField, validateEmail, validatePhone, ValidationRule } from './validation';

describe('validateField', () => {
  describe('Required Validation', () => {
    it('should pass when value is provided for required field', () => {
      const result = validateField('test value', { required: true });
      expect(result.valid).toBe(true);
    });

    it('should fail when empty string provided for required field', () => {
      const result = validateField('', { required: true });
      expect(result.valid).toBe(false);
      expect(result.message).toBe('This field is required');
    });

    it('should fail when whitespace only provided for required field', () => {
      const result = validateField('   ', { required: true });
      expect(result.valid).toBe(false);
      expect(result.message).toBe('This field is required');
    });

    it('should use custom error message for required field', () => {
      const result = validateField('', {
        required: true,
        message: 'Email is required',
      });
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Email is required');
    });

    it('should allow empty value when field not required', () => {
      const result = validateField('', { required: false });
      expect(result.valid).toBe(true);
    });
  });

  describe('MinLength Validation', () => {
    it('should pass when value meets minimum length', () => {
      const result = validateField('hello', { minLength: 5 });
      expect(result.valid).toBe(true);
    });

    it('should pass when value exceeds minimum length', () => {
      const result = validateField('hello world', { minLength: 5 });
      expect(result.valid).toBe(true);
    });

    it('should fail when value is shorter than minimum', () => {
      const result = validateField('hi', { minLength: 5 });
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Minimum 5 characters required');
    });

    it('should use custom error message for minLength', () => {
      const result = validateField('hi', {
        minLength: 5,
        message: 'Password must be at least 5 characters',
      });
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password must be at least 5 characters');
    });

    it('should skip minLength validation when value is empty and not required', () => {
      const result = validateField('', { minLength: 5 });
      expect(result.valid).toBe(true);
    });
  });

  describe('MaxLength Validation', () => {
    it('should pass when value is within maximum length', () => {
      const result = validateField('hello', { maxLength: 10 });
      expect(result.valid).toBe(true);
    });

    it('should pass when value exactly equals maximum length', () => {
      const result = validateField('hello', { maxLength: 5 });
      expect(result.valid).toBe(true);
    });

    it('should fail when value exceeds maximum length', () => {
      const result = validateField('hello world', { maxLength: 5 });
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Maximum 5 characters allowed');
    });

    it('should use custom error message for maxLength', () => {
      const result = validateField('this is way too long', {
        maxLength: 10,
        message: 'Tweet must be under 10 characters',
      });
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Tweet must be under 10 characters');
    });

    it('should skip maxLength validation when value is empty', () => {
      const result = validateField('', { maxLength: 5 });
      expect(result.valid).toBe(true);
    });
  });

  describe('Email Validation', () => {
    it('should pass for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'first+last@domain.com',
        'name123@test-domain.org',
      ];

      validEmails.forEach((email) => {
        const result = validateField(email, { email: true });
        expect(result.valid).toBe(true);
      });
    });

    it('should fail for invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        'missing@domain',
        '@nodomain.com',
        'no-at-sign.com',
        'spaces in@email.com',
        'double@@domain.com',
      ];

      invalidEmails.forEach((email) => {
        const result = validateField(email, { email: true });
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Invalid email address');
      });
    });

    it('should use custom error message for email validation', () => {
      const result = validateField('invalid', {
        email: true,
        message: 'Please enter a valid email address',
      });
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid email address');
    });

    it('should skip email validation when value is empty', () => {
      const result = validateField('', { email: true });
      expect(result.valid).toBe(true);
    });
  });

  describe('Pattern Validation', () => {
    it('should pass when value matches pattern', () => {
      const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
      const result = validateField('123-456-7890', { pattern: phonePattern });
      expect(result.valid).toBe(true);
    });

    it('should fail when value does not match pattern', () => {
      const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
      const result = validateField('1234567890', { pattern: phonePattern });
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid format');
    });

    it('should use custom error message for pattern validation', () => {
      const zipPattern = /^\d{5}$/;
      const result = validateField('abc', {
        pattern: zipPattern,
        message: 'ZIP code must be 5 digits',
      });
      expect(result.valid).toBe(false);
      expect(result.message).toBe('ZIP code must be 5 digits');
    });

    it('should work with complex regex patterns', () => {
      // Password: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

      const validPasswords = ['Password1', 'SecurePass123', 'MyP@ssw0rd'];
      validPasswords.forEach((password) => {
        const result = validateField(password, { pattern: passwordPattern });
        expect(result.valid).toBe(true);
      });

      const invalidPasswords = ['password', 'PASSWORD', '12345678', 'Pass1'];
      invalidPasswords.forEach((password) => {
        const result = validateField(password, { pattern: passwordPattern });
        expect(result.valid).toBe(false);
      });
    });

    it('should skip pattern validation when value is empty', () => {
      const pattern = /^\d+$/;
      const result = validateField('', { pattern });
      expect(result.valid).toBe(true);
    });
  });

  describe('Combined Validations', () => {
    it('should validate multiple rules together', () => {
      const rules: ValidationRule = {
        required: true,
        minLength: 8,
        maxLength: 20,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      };

      // Valid: meets all requirements
      expect(validateField('SecurePass123', rules).valid).toBe(true);

      // Invalid: empty (required fails first)
      const emptyResult = validateField('', rules);
      expect(emptyResult.valid).toBe(false);
      expect(emptyResult.message).toContain('required');

      // Invalid: too short (minLength fails)
      const shortResult = validateField('Pass1', rules);
      expect(shortResult.valid).toBe(false);
      expect(shortResult.message).toContain('Minimum');

      // Invalid: too long (maxLength fails)
      const longResult = validateField('VeryLongPassword123456', rules);
      expect(longResult.valid).toBe(false);
      expect(longResult.message).toContain('Maximum');

      // Invalid: pattern fails (no uppercase)
      const patternResult = validateField('password123', rules);
      expect(patternResult.valid).toBe(false);
      expect(patternResult.message).toContain('Invalid format');
    });

    it('should apply validations in order (required > minLength > maxLength > email > pattern)', () => {
      // When multiple rules fail, the first failing rule's message is returned
      const rules: ValidationRule = {
        required: true,
        minLength: 5,
        email: true,
      };

      // Empty value fails required check first
      const result = validateField('', rules);
      expect(result.message).toContain('required');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined value', () => {
      const result = validateField(undefined as any, { required: true });
      expect(result.valid).toBe(false);
    });

    it('should handle null value', () => {
      const result = validateField(null as any, { required: true });
      expect(result.valid).toBe(false);
    });

    it('should pass when no validation rules provided', () => {
      const result = validateField('any value', {});
      expect(result.valid).toBe(true);
    });

    it('should handle special characters in values', () => {
      const result = validateField('test@#$%^&*()', { minLength: 5 });
      expect(result.valid).toBe(true);
    });

    it('should handle unicode characters', () => {
      const result = validateField('привет мир 你好', { minLength: 5 });
      expect(result.valid).toBe(true);
    });

    it('should handle emoji in values', () => {
      const result = validateField('Hello 👋 World 🌍', { minLength: 5 });
      expect(result.valid).toBe(true);
    });
  });
});

describe('validateEmail', () => {
  it('should return true for valid email addresses', () => {
    const validEmails = [
      'simple@example.com',
      'firstname.lastname@example.com',
      'email@subdomain.example.com',
      'firstname+lastname@example.com',
      '1234567890@example.com',
      'email@example-one.com',
      '_______@example.com',
      'email@example.name',
      'email@example.museum',
      'email@example.co.jp',
    ];

    validEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(true);
    });
  });

  it('should return false for invalid email addresses', () => {
    const invalidEmails = [
      'plaintext',
      '@no-local.com',
      'no-at-sign.com',
      'two@@domain.com',
      'spaces in@email.com',
    ];

    invalidEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(false);
    });
  });

  it('should return false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(validateEmail(' ')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@test.com')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('should return true for valid phone numbers', () => {
    // Note: regex is /^[\d\s\-+()]{10,}$/ - allows digits, spaces, dashes, plus, parens
    const validPhones = [
      '1234567890',
      '123-456-7890',
      '(123) 456-7890',
      '+1 123 456 7890',
      '+44 20 1234 5678',
      '+1-555-555-5555',
      '(555)123-4567',
    ];

    validPhones.forEach((phone) => {
      expect(validatePhone(phone)).toBe(true);
    });
  });

  it('should return false for invalid phone numbers', () => {
    const invalidPhones = [
      '123',
      'abc',
      '123-abc-7890',
      'notaphone',
      '',
      '12345', // too short
    ];

    invalidPhones.forEach((phone) => {
      expect(validatePhone(phone)).toBe(false);
    });
  });

  it('should require at least 10 characters', () => {
    expect(validatePhone('123456789')).toBe(false); // 9 chars
    expect(validatePhone('1234567890')).toBe(true); // 10 chars
  });

  it('should handle international formats', () => {
    expect(validatePhone('+1 (555) 123-4567')).toBe(true);
    expect(validatePhone('+44 20 7946 0958')).toBe(true);
    expect(validatePhone('+86 10 1234 5678')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(validatePhone('')).toBe(false);
  });
});
