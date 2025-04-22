/**
 * Background service worker for the General Download Renamer extension
 * Handles download interception and renaming logic
 */

// Default renaming pattern
const DEFAULT_PATTERN = '{date}_{originalFilename}{ext}';

// Track the current state of the extension
let isEnabled = true;
let userPattern = DEFAULT_PATTERN;

// Initialize extension state from storage
chrome.storage.local.get(['enabled', 'pattern'], (result) => {
  isEnabled = result.enabled !== undefined ? result.enabled : true;
  userPattern = result.pattern || DEFAULT_PATTERN;
  console.log('Extension initialized:', { isEnabled, userPattern });
});

// Listen for storage changes to update settings dynamically
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled !== undefined) {
    isEnabled = changes.enabled.newValue;
    console.log('Extension enabled state changed:', isEnabled);
  }
  
  if (changes.pattern !== undefined) {
    userPattern = changes.pattern.newValue;
    console.log('Renaming pattern changed:', userPattern);
  }
});

/**
 * Utility function - Splits a filename into name and extension parts
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

/**
 * Utility function - Formats the current date as YYYYMMDD
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
 * Processes a download and suggests a new filename based on the current pattern
 * @param {Object} downloadItem - The Chrome download item object
 * @param {Function} suggest - Callback to suggest the new filename
 */
function processDownload(downloadItem, suggest) {
  // If extension is disabled, keep original filename
  if (!isEnabled) {
    suggest({ filename: downloadItem.filename });
    return;
  }
  
  try {
    // Get the original filename and split it
    const originalFilename = downloadItem.filename;
    const { name, ext } = splitFilename(originalFilename);
    
    // For Phase 2, we'll use a simple hardcoded pattern with just date and original name
    // In Phase 4, we'll implement the full pattern replacement
    const date = getFormattedDate();
    const newFilename = `${date}_${name}${ext}`;
    
    console.log(`Renaming: ${originalFilename} -> ${newFilename}`);
    
    // Suggest the new filename
    suggest({ filename: newFilename });
  } catch (error) {
    console.error('Error processing download:', error);
    // In case of error, use the original filename
    suggest({ filename: downloadItem.filename });
  }
}

// Implement the download listener
chrome.downloads.onDeterminingFilename.addListener(processDownload);

// Log that the service worker has started
console.log('General Download Renamer service worker initialized'); 