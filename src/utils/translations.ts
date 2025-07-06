/**
 * A utility function to safely handle translations
 * Returns the translated string if available, or falls back to the key
 * to prevent displaying raw translation keys to users
 */
export function safeTrans(
  t: (key: string, options?: any) => string, 
  key: string, 
  options?: any
): string {
  try {
    const translation = t(key, options);
    
    // If the translation function returns the key itself (not found)
    // or returns an empty string, fall back to a humanized version of the key
    if (translation === key || !translation) {
      return humanizeKey(key);
    }
    
    return translation;
  } catch (error) {
    console.warn(`Translation error for key "${key}":`, error);
    return humanizeKey(key);
  }
}

/**
 * Converts a camelCase or snake_case key into a humanized string
 * Example: "firstName" -> "First Name"
 * Example: "user_profile" -> "User Profile"
 */
function humanizeKey(key: string): string {
  // Handle both camelCase and snake_case
  return key
    // Insert a space before all uppercase letters
    .replace(/([A-Z])/g, ' $1')
    // Replace underscores with spaces
    .replace(/_/g, ' ')
    // Ensure the first character is uppercase
    .replace(/^./, str => str.toUpperCase())
    // Remove any extra spaces
    .trim();
} 