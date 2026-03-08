/**
 * Sanitizes user input to prevent XSS attacks
 * Escapes HTML special characters to make user input safe for display
 * 
 * @param {string} str - Raw user input
 * @returns {string} - Sanitized string safe for display in HTML
 * 
 * @example
 * sanitizeInput('<script>alert("xss")</script>')
 * // returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function sanitizeInput(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
