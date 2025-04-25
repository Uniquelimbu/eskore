/**
 * Utility functions for date handling
 */

/**
 * Format a date string in a human-readable format
 * @param {string} dateString - The date string to format
 * @param {Object} options - Options for formatting (optional)
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Default options
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    // Merge with provided options
    const formatOptions = { ...defaultOptions, ...options };
    
    return date.toLocaleDateString(undefined, formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if there's an error
  }
};

/**
 * Calculate age from a date of birth
 * @param {string} dob - Date of birth string
 * @returns {number} - Age in years, or null if invalid
 */
export const calculateAge = (dob) => {
  if (!dob) return null;
  
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date string for input fields
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};
