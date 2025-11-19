/**
 * Form validation utilities
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule[];
}

export interface ValidationErrors {
  [field: string]: string;
}

/**
 * Validate a single field
 */
export function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (rule.required && !value) {
      return rule.message;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return rule.message;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    if (rule.custom && !rule.custom(value)) {
      return rule.message;
    }
  }

  return null;
}

/**
 * Validate all fields in a form
 */
export function validateForm(
  values: Record<string, any>,
  rules: ValidationRules
): ValidationErrors {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const error = validateField(values[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

/**
 * Common validation rules
 */
export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    message: 'Password must be at least 8 characters long',
  },
  required: (fieldName: string) => ({
    required: true,
    message: `${fieldName} is required`,
  }),
  minLength: (length: number, fieldName: string) => ({
    minLength: length,
    message: `${fieldName} must be at least ${length} characters`,
  }),
  maxLength: (length: number, fieldName: string) => ({
    maxLength: length,
    message: `${fieldName} must not exceed ${length} characters`,
  }),
};

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Format error messages for display
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
