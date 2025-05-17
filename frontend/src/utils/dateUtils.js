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
    // Create a date that respects the input format without timezone offset issues
    const parts = dob.split('-');
    if (parts.length !== 3) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(parts[2], 10);
    
    const birthDate = new Date(year, month, day);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const currentMonth = today.getMonth();
    const birthMonth = birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (currentMonth < birthMonth || 
        (currentMonth === birthMonth && today.getDate() < birthDate.getDate())) {
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
 * @param {string | Date} dateString - The date string or Date object to format
 * @returns {string} - The formatted date string for input fields (YYYY-MM-DD), or empty string if invalid.
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    let dateToFormat;

    // If dateString is already a Date object, use it directly.
    if (dateString instanceof Date) {
      dateToFormat = dateString;
    } 
    // If dateString is a string that matches "YYYY-MM-DD"
    else if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // Parse it as local date to avoid timezone issues if it was meant to be local.
      // new Date('YYYY-MM-DD') parses as UTC midnight.
      const parts = dateString.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed for Date constructor
      const day = parseInt(parts[2], 10);
      
      // Check for obviously invalid parts before constructing Date
      if (year < 1000 || year > 9999 || month < 0 || month > 11 || day < 1 || day > 31) {
        console.error('Invalid date components in YYYY-MM-DD string:', dateString);
        return '';
      }
      
      dateToFormat = new Date(year, month, day);

      // Verify that the Date object construction didn't shift the date due to invalid components (e.g., "2023-02-30")
      if (dateToFormat.getFullYear() !== year || dateToFormat.getMonth() !== month || dateToFormat.getDate() !== day) {
        console.error('Date components shifted after Date construction, original string was likely invalid:', dateString);
        return ''; 
      }
    } 
    // For other string formats, or numbers (timestamps)
    else {
      dateToFormat = new Date(dateString);
    }
    
    // Check if the final date object is valid
    if (isNaN(dateToFormat.getTime())) {
      console.error('Invalid date provided to formatDateForInput after parsing:', dateString);
      return '';
    }
    
    // Format the date as YYYY-MM-DD using its local components
    const year = dateToFormat.getFullYear();
    const monthStr = String(dateToFormat.getMonth() + 1).padStart(2, '0');
    const dayStr = String(dateToFormat.getDate()).padStart(2, '0');
    
    return `${year}-${monthStr}-${dayStr}`;
  } catch (error) {
    console.error('Error in formatDateForInput:', error, '; Original dateString:', dateString);
    return ''; // Return empty string on any unexpected error
  }
};

/**
 * Format a date for display (consistent with API format)
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date string for display
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date for display:', dateString);
      return '';
    }
    
    // Parse the input date manually to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // months are 0-indexed
    const day = date.getUTCDate();
    
    // Create display format (Month Day, Year)
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${months[month-1]} ${day}, ${year}`;
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '';
  }
};
