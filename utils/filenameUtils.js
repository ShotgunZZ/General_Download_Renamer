/**
 * Utility functions for filename manipulation
 * Used by the background service worker for processing download filenames
 */

/**
 * Sanitizes a filename by removing or replacing invalid characters
 * @param {string} filename - The filename to sanitize
 * @returns {string} The sanitized filename
 */
function sanitizeFilename(filename) {
  // Replace invalid characters (/, \, :, *, ?, ", <, >, |) with underscores
  return filename.replace(/[\/\\:*?"<>|]/g, '_');
}

/**
 * Extracts the domain from a URL
 * @param {string} url - The URL to extract the domain from
 * @returns {string} The extracted domain or 'unknown' if it can't be extracted
 */
function extractDomain(url) {
  try {
    // Create a URL object to easily parse the URL
    const urlObj = new URL(url);
    // Return just the hostname (e.g., example.com)
    return urlObj.hostname;
  } catch (error) {
    console.error('Error extracting domain:', error);
    return 'unknown';
  }
}

/**
 * Formats the current date as YYYYMMDD
 * @returns {string} The formatted date
 */
function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  // Add leading zeros for month and day
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

/**
 * Formats the current time as HHMMSS
 * @returns {string} The formatted time
 */
function getFormattedTime() {
  const now = new Date();
  // Add leading zeros for hours, minutes, and seconds
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${hours}${minutes}${seconds}`;
}

/**
 * Formats the current timestamp as YYYYMMDD-HHMMSS
 * @returns {string} The formatted timestamp
 */
function getFormattedTimestamp() {
  return `${getFormattedDate()}-${getFormattedTime()}`;
}

/**
 * Splits a filename into name and extension parts
 * @param {string} filename - The filename to split
 * @returns {Object} Object containing {name, ext} properties
 */
function splitFilename(filename) {
  // Find the last occurrence of a dot
  const lastDotIndex = filename.lastIndexOf('.');
  
  // If there's no dot or it's at the start, consider the whole string as the name
  if (lastDotIndex <= 0) {
    return {
      name: filename,
      ext: ''
    };
  }
  
  // Split into name and extension
  return {
    name: filename.substring(0, lastDotIndex),
    ext: filename.substring(lastDotIndex) // Includes the dot
  };
}

// Export functions for use in other modules
// These will be implemented in Phase 4
// export {
//   sanitizeFilename,
//   extractDomain,
//   getFormattedDate,
//   getFormattedTime,
//   getFormattedTimestamp,
//   splitFilename
// }; 