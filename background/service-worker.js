/**
 * Background service worker for the General Download Renamer extension
 * Handles download interception and renaming logic
 */

// Import utility functions
import {
  sanitizeFilename,
  extractDomain,
  getFormattedDate,
  getFormattedTime,
  getFormattedTimestamp,
  splitFilename,
  processPattern
} from '../utils/filenameUtils.js';

// Default renaming pattern
const DEFAULT_PATTERN = '{date}{originalFilename}{ext}';
const DEFAULT_SEPARATOR = '_';

// Track the current state of the extension
let isEnabled = true;
let userPattern = DEFAULT_PATTERN;
let userSeparator = DEFAULT_SEPARATOR;

// Initialize extension state from storage
chrome.storage.local.get(['enabled', 'pattern', 'separator'], (result) => {
  isEnabled = result.enabled !== undefined ? result.enabled : true;
  userPattern = result.pattern || DEFAULT_PATTERN;
  userSeparator = result.separator !== undefined ? result.separator : DEFAULT_SEPARATOR;
  console.log('Extension initialized:', { isEnabled, userPattern, userSeparator });
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
  
  if (changes.separator !== undefined) {
    userSeparator = changes.separator.newValue;
    console.log('Separator changed:', userSeparator);
  }
});

/**
 * Processes a download and suggests a new filename based on the current pattern and separator
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
    const { name: nameWithoutExt, ext } = splitFilename(originalFilename);
    
    // Get download source URL and extract domain
    const sourceUrl = downloadItem.url || '';
    const domain = extractDomain(sourceUrl);
    
    // Get current date and time
    const date = getFormattedDate();
    const time = getFormattedTime();
    const timestamp = getFormattedTimestamp();
    
    // Create placeholder values object
    const placeholders = {
      domain: domain,
      timestamp: timestamp,
      date: date,
      time: time,
      originalFilename: nameWithoutExt,
      ext: ext
    };
    
    // Process the user's pattern, passing the separator
    let newFilename = processPattern(userPattern, placeholders, userSeparator);
    
    // Sanitize the new filename to remove invalid characters
    newFilename = sanitizeFilename(newFilename);
    
    console.log(`Renaming: ${originalFilename} -> ${newFilename}`);
    
    // Suggest the new filename
    suggest({ filename: newFilename });
  } catch (error) {
    console.error('Error processing download:', error);
    // In case of error, use the original filename
    suggest({ filename: downloadItem.filename });
  }
}

// Listen for extension install or update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated:', details.reason);
  
  // Set default settings if not already set
  chrome.storage.local.get(['enabled', 'pattern', 'separator'], (result) => {
    const settings = {};
    
    if (result.enabled === undefined) {
      settings.enabled = true;
    }
    
    if (!result.pattern) {
      settings.pattern = DEFAULT_PATTERN;
    }
    
    if (result.separator === undefined) {
      settings.separator = DEFAULT_SEPARATOR;
    }
    
    if (Object.keys(settings).length > 0) {
      chrome.storage.local.set(settings, () => {
        console.log('Default settings set:', settings);
      });
    }
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  if (message.action === 'openOptionsPage') {
    chrome.runtime.openOptionsPage();
  }
  
  // Always return true if you're sending a response asynchronously
  return true;
});

// Implement the download listener
chrome.downloads.onDeterminingFilename.addListener(processDownload);

// Log that the service worker has started
console.log('General Download Renamer service worker initialized'); 