/**
 * Centralized error handling utility for API responses
 */

/**
 * Process API error and set appropriate error message
 * 
 * @param {Error} error - The caught error object
 * @param {Function} setErrorCallback - Function to set error state
 * @returns {string} - Processed error message
 */
export const handleApiError = (error, setErrorCallback = null) => {
  let errorMessage = 'An unexpected error occurred. Please try again.';
  
  // Check if it's an axios error with a response
  if (error.response) {
    // Server responded with a non-2xx status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        errorMessage = data.message || 'Invalid request. Please check your data.';
        break;
      case 401:
        errorMessage = 'Your session has expired. Please log in again.';
        break;
      case 403:
        errorMessage = 'You don\'t have permission to access this resource.';
        break;
      case 404:
        errorMessage = 'The requested resource could not be found.';
        break;
      case 422:
        errorMessage = data.message || 'Validation failed. Please check your input.';
        break;
      case 429:
        errorMessage = 'Too many requests. Please try again later.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        errorMessage = data.message || 'An error occurred. Please try again.';
    }
  } else if (error.request) {
    // Request was made but no response received
    errorMessage = 'No response from server. Please check your internet connection.';
  } else {
    // Error in setting up the request
    errorMessage = error.message || 'Error setting up request. Please try again.';
  }
  
  // If a callback function was provided, call it with the error message
  if (setErrorCallback && typeof setErrorCallback === 'function') {
    setErrorCallback(errorMessage);
  }
  
  // Log the error for debugging (consider using a logging service in production)
  console.error('API Error:', error);
  
  return errorMessage;
};

/**
 * Format validation errors from API responses
 * 
 * @param {Object} validationErrors - Object containing validation errors
 * @returns {Object} - Formatted error messages by field
 */
export const formatValidationErrors = (validationErrors) => {
  if (!validationErrors) return {};
  
  const formattedErrors = {};
  
  for (const field in validationErrors) {
    if (Object.prototype.hasOwnProperty.call(validationErrors, field)) {
      formattedErrors[field] = validationErrors[field].join(' ');
    }
  }
  
  return formattedErrors;
};
