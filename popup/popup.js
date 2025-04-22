/**
 * Popup script for the Download Renamer extension
 * Handles enable/disable toggle and navigation to options
 */

// DOM elements
const enabledToggle = document.getElementById('enabled');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const optionsButton = document.getElementById('options-btn');
const currentPatternDisplay = document.getElementById('current-pattern');

// Default pattern
const DEFAULT_PATTERN = '{date}_{originalFilename}{ext}';

/**
 * Updates the UI based on the enabled state
 * @param {boolean} isEnabled - Whether the extension is enabled
 */
function updateUIState(isEnabled) {
  enabledToggle.checked = isEnabled;
  
  if (isEnabled) {
    statusIndicator.classList.add('active');
    statusText.textContent = 'Active';
  } else {
    statusIndicator.classList.remove('active');
    statusText.textContent = 'Inactive';
  }
}

/**
 * Loads settings from storage and updates the UI
 */
function loadSettings() {
  chrome.storage.local.get(['enabled', 'pattern'], (result) => {
    // Update toggle and status based on enabled state
    const isEnabled = result.enabled !== undefined ? result.enabled : true;
    updateUIState(isEnabled);
    
    // Update pattern display
    currentPatternDisplay.textContent = result.pattern || DEFAULT_PATTERN;
  });
}

/**
 * Saves the enabled status to storage
 * @param {boolean} isEnabled - Whether the extension is enabled
 */
function saveEnabledStatus(isEnabled) {
  chrome.storage.local.set({ enabled: isEnabled }, () => {
    updateUIState(isEnabled);
  });
}

/**
 * Opens the options page
 */
function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings);

// Add event listeners
enabledToggle.addEventListener('change', () => {
  saveEnabledStatus(enabledToggle.checked);
});

optionsButton.addEventListener('click', openOptionsPage); 