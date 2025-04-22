/**
 * Options page for the General Download Renamer extension
 * Handles saving and loading user preferences
 */

// Default pattern to use if none is set
const DEFAULT_PATTERN = '{date}_{originalFilename}{ext}';

// DOM elements
const enabledToggle = document.getElementById('enabled');
const patternInput = document.getElementById('pattern');
const saveButton = document.getElementById('save-btn');
const statusMessage = document.getElementById('status-message');

/**
 * Loads saved options from Chrome storage
 */
function loadOptions() {
  chrome.storage.local.get(['enabled', 'pattern'], (result) => {
    // Set enabled toggle (default to enabled if not set)
    enabledToggle.checked = result.enabled !== undefined ? result.enabled : true;
    
    // Set pattern input (default to DEFAULT_PATTERN if not set)
    patternInput.value = result.pattern || DEFAULT_PATTERN;
  });
}

/**
 * Saves options to Chrome storage
 */
function saveOptions() {
  // Get current values
  const enabled = enabledToggle.checked;
  const pattern = patternInput.value.trim() || DEFAULT_PATTERN;
  
  // Save to Chrome storage
  chrome.storage.local.set({ 
    enabled: enabled,
    pattern: pattern
  }, () => {
    // Show success message
    showStatusMessage('Settings saved!');
  });
}

/**
 * Displays a status message and fades it out
 * @param {string} message - The message to display
 */
function showStatusMessage(message) {
  statusMessage.textContent = message;
  statusMessage.style.opacity = '1';
  
  // Hide message after 2 seconds
  setTimeout(() => {
    statusMessage.style.opacity = '0';
  }, 2000);
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', loadOptions);

// Add event listener for save button
saveButton.addEventListener('click', saveOptions); 