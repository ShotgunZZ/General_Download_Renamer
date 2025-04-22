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

// TODO: Implement the download listener in Phase 2
// chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
//   // Renaming logic will be implemented here
// });

// Log that the service worker has started
console.log('General Download Renamer service worker initialized'); 