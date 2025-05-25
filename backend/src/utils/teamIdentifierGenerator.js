/**
 * Utility to generate unique team identifiers in the format AAA-NNN
 * 
 * AAA = three-letter slug from team name (letters only, uppercase; pad with X if shorter)
 * NNN = three-digit number from hashing the team's ID (hash % 1000, zero-padded)
 */

/**
 * FNV-1a 32-bit hash implementation
 * @param {number} id - The team's primary key ID
 * @returns {number} - 32-bit hash value
 */
const fnv1aHash = (id) => {
  // FNV-1a constants for 32-bit hash
  const FNV_PRIME = 16777619;
  const FNV_OFFSET_BASIS = 2166136261;
  
  // Convert ID to string and then to bytes
  const bytes = String(id).split('').map(char => char.charCodeAt(0));
  
  // Apply FNV-1a algorithm
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, FNV_PRIME) | 0; // The | 0 ensures 32-bit integer arithmetic
  }
  
  // Make hash positive and return
  return hash >>> 0;
};

/**
 * Extract three-letter slug from team name
 * @param {string} name - Team name
 * @returns {string} - Three-letter uppercase slug
 */
const extractNameSlug = (name) => {
  if (!name || typeof name !== 'string') return 'XXX';
  
  // 1. Remove non-alphabetic characters and convert to uppercase
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  
  // 2. Handle different name formats
  if (cleanName.length <= 3) {
    // If name is 3 letters or fewer, pad with X
    return cleanName.padEnd(3, 'X');
  } else {
    // For longer names, we have multiple strategies:
    // Try to get first letters of words (if name has multiple words)
    const words = name.split(/\s+/);
    if (words.length >= 3) {
      // Take first letter of first three words
      return words.slice(0, 3)
        .map(word => word[0])
        .join('')
        .toUpperCase();
    } else if (words.length === 2) {
      // With two words, take first letter of first word and first two of second
      // (or adjust as needed)
      const firstInitial = words[0][0];
      const secondInitials = words[1].substring(0, 2);
      return (firstInitial + secondInitials).toUpperCase();
    } else {
      // For single-word names, take first three letters
      return cleanName.substring(0, 3);
    }
  }
};

/**
 * Generate numeric part of the identifier (NNN) from team ID using FNV-1a hash
 * @param {number} id - The team's primary key ID
 * @returns {string} - Three-digit numeric string, zero-padded
 */
const generateNumericPart = (id) => {
  const hash = fnv1aHash(id);
  const num = hash % 1000; // Get last three digits
  return num.toString().padStart(3, '0'); // Zero-pad to ensure 3 digits
};

/**
 * Generate complete team identifier
 * @param {string} name - Team name
 * @param {number} id - Team ID
 * @returns {string} - Identifier in format AAA-NNN
 */
const generateTeamIdentifier = (name, id) => {
  const slug = extractNameSlug(name);
  const number = generateNumericPart(id);
  return `${slug}-${number}`;
};

module.exports = {
  generateTeamIdentifier,
  extractNameSlug,
  generateNumericPart
};
