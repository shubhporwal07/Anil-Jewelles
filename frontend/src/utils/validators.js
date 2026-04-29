/**
 * Validation utilities for form fields
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid, errors: [] }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate password confirmation
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @returns {string|null} Error message or null if valid
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

/**
 * Get Firebase error message
 * @param {Error} error - Firebase error
 * @returns {string} User-friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/invalid-credential':
      return 'Invalid email or password. Check that the account exists in this Firebase project.';
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-email':
      return 'Invalid email format';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is not enabled';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password';
    case 'auth/invalid-password':
      return 'Password must be at least 6 characters';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email';
    case 'auth/popup-closed-by-user':
      return null; // Silent error
    case 'auth/popup-blocked':
      return 'Login popup was blocked. Please allow popups in your browser';
    case 'auth/operation-not-supported-in-this-environment':
      return 'This authentication method is not supported in your browser';
    default:
      return error.message || 'An error occurred during authentication';
  }
};

/**
 * Format error for display
 * @param {string|Error} error - Error to format
 * @returns {string} Formatted error message
 */
export const formatError = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  return error?.message || 'An unexpected error occurred';
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate form data
 * @param {Object} data - Form data to validate
 * @param {Array} rules - Validation rules
 * @returns {Object} Errors object
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];

    if (rule.required && !value) {
      errors[field] = `${rule.label || field} is required`;
    } else if (value && rule.validate) {
      const error = rule.validate(value);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};
