/**
 * Content script for the Download Renamer floating icon.
 */

(() => {
  // --- Constants and State ---
  const ICON_ID = 'dr-floating-icon';
  const POPUP_ID = 'dr-popup-panel';
  const DEFAULT_PATTERN = '{date}_{originalFilename}{ext}';
  let floatingIcon = null;
  let popupPanel = null;
  let isDragging = false;
  let offsetX, offsetY;
  let currentSettings = { enabled: true, pattern: DEFAULT_PATTERN };

  // --- Core Functions ---

  /**
   * Creates and injects the floating icon element.
   */
  function createIcon() {
    if (document.getElementById(ICON_ID)) return; // Already exists

    floatingIcon = document.createElement('div');
    floatingIcon.id = ICON_ID;
    floatingIcon.title = 'Download Renamer (Click for menu, drag to move)';

    const iconImage = document.createElement('img');
    iconImage.id = 'dr-floating-icon-img';
    try {
      iconImage.src = chrome.runtime.getURL('icons/icon48.png');
    } catch (error) {
      console.error('[DR Icon] Error getting icon URL:', error);
      // Don't proceed if icon URL fails (likely invalid context)
      return;
    }
    iconImage.alt = 'DR';

    floatingIcon.appendChild(iconImage);
    document.body.appendChild(floatingIcon);

    updateIconAppearance();
    setupDraggable();
    setupClickHandlers();
  }

  /**
   * Creates the popup panel element (initially hidden).
   */
  function createPopup() {
    if (document.getElementById(POPUP_ID)) return;

    popupPanel = document.createElement('div');
    popupPanel.id = POPUP_ID;
    document.body.appendChild(popupPanel);
  }

  /**
   * Fetches settings and updates the popup's content and visibility.
   */
  function showPopup() {
    if (!popupPanel || !floatingIcon) return;

    chrome.storage.local.get(['enabled', 'pattern'], (result) => {
      currentSettings.enabled = result.enabled !== undefined ? result.enabled : true;
      currentSettings.pattern = result.pattern || DEFAULT_PATTERN;

      // Build popup HTML
      popupPanel.innerHTML = `
        <h3>Download Renamer</h3>
        <div class="dr-toggle-container">
          <label class="dr-toggle-label">
            <span>Enable Renaming</span>
            <div class="dr-toggle-switch">
              <input type="checkbox" id="dr-popup-enabled" ${currentSettings.enabled ? 'checked' : ''}>
              <span class="dr-toggle-slider"></span>
            </div>
          </label>
        </div>
        <div class="dr-button-container">
          <button id="dr-popup-options-btn" class="dr-button">Options</button>
        </div>
        <div class="dr-footer">
          Current pattern: <span class="dr-current-pattern">${escapeHtml(currentSettings.pattern)}</span>
        </div>
      `;

      // Add event listeners *after* innerHTML is set
      addPopupEventListeners();

      // Position and show
      positionPopup();
      popupPanel.classList.add('visible');
    });
  }

  /**
   * Hides the popup panel.
   */
  function hidePopup() {
    if (popupPanel) {
      popupPanel.classList.remove('visible');
      // Optional: Remove content after fade-out? 
      // setTimeout(() => { popupPanel.innerHTML = ''; }, 200);
    }
  }
  
  /**
   * Adds event listeners to elements inside the popup.
   */
  function addPopupEventListeners() {
    const toggle = popupPanel.querySelector('#dr-popup-enabled');
    const optionsBtn = popupPanel.querySelector('#dr-popup-options-btn');

    if (toggle) {
      toggle.addEventListener('change', handleToggleChange);
    }
    if (optionsBtn) {
      optionsBtn.addEventListener('click', handleOptionsClick);
    }
  }
  
  /**
   * Handles the enable/disable toggle change.
   * @param {Event} event - The change event.
   */
  function handleToggleChange(event) {
    const isEnabled = event.target.checked;
    chrome.storage.local.set({ enabled: isEnabled });
    // No need to call updateIconAppearance, storage listener will handle it
  }
  
  /**
   * Handles the click on the options button.
   */
  function handleOptionsClick() {
    chrome.runtime.sendMessage({ action: 'openOptionsPage' });
    hidePopup();
  }

  /**
   * Positions the popup relative to the floating icon.
   */
  function positionPopup() {
    if (!popupPanel || !floatingIcon) return;

    const iconRect = floatingIcon.getBoundingClientRect();
    const panelRect = popupPanel.getBoundingClientRect(); // Might be 0 if first time
    const panelWidth = panelRect.width || 260; // Use default width if needed
    const panelHeight = panelRect.height || 150; // Estimate height

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 10; // Space from icon and viewport edges

    // Try position above the icon first
    let top = iconRect.top - panelHeight - margin;
    let left = iconRect.left + (iconRect.width / 2) - (panelWidth / 2); // Center horizontally

    // If above goes off-screen, try below
    if (top < margin) {
      top = iconRect.bottom + margin;
    }

    // Adjust horizontal position to stay in viewport
    if (left < margin) {
      left = margin;
    } else if (left + panelWidth > viewportWidth - margin) {
      left = viewportWidth - panelWidth - margin;
    }
    
    // Adjust vertical position to stay in viewport
    if (top + panelHeight > viewportHeight - margin) {
        top = Math.max(margin, viewportHeight - panelHeight - margin);
        // If positioning below also went off screen (small screens)
        // and positioning above would have been better, reconsider.
        let potentialTop = iconRect.top - panelHeight - margin;
        if(potentialTop >= margin) top = potentialTop;
    }

    popupPanel.style.top = `${top}px`;
    popupPanel.style.left = `${left}px`;
  }

  /**
   * Updates the icon's appearance based on the enabled state.
   * (Adds/removes .active/.inactive classes)
   */
  function updateIconAppearance() {
    if (!floatingIcon) return;
    
    if (currentSettings.enabled) {
      floatingIcon.classList.add('active');
      floatingIcon.classList.remove('inactive');
      // Ensure opacity is set correctly if transitioning from inactive
      // floatingIcon.style.opacity = '1'; 
    } else {
      floatingIcon.classList.add('inactive');
      floatingIcon.classList.remove('active');
      // Ensure opacity is set correctly if transitioning from active
      // floatingIcon.style.opacity = '0.65'; 
    }
    // Opacity is now handled by the CSS classes, so direct style manipulation is removed.
  }

  /**
   * Sets up dragging functionality for the icon.
   */
  function setupDraggable() {
    if (!floatingIcon) return;

    floatingIcon.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only main button
      isDragging = true;
      offsetX = e.clientX - floatingIcon.getBoundingClientRect().left;
      offsetY = e.clientY - floatingIcon.getBoundingClientRect().top;
      floatingIcon.style.transition = 'none'; // Disable transition during drag
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', stopDrag, { once: true }); // Use once
      e.preventDefault(); // Prevent text selection
    });

    function handleDrag(e) {
      if (!isDragging) return;
      // Calculate new position within viewport bounds
      const x = Math.min(
        window.innerWidth - floatingIcon.offsetWidth, 
        Math.max(0, e.clientX - offsetX)
      );
      const y = Math.min(
        window.innerHeight - floatingIcon.offsetHeight, 
        Math.max(0, e.clientY - offsetY)
      );
      floatingIcon.style.left = `${x}px`;
      floatingIcon.style.top = `${y}px`;
      // Overwrite fixed bottom/right positioning
      floatingIcon.style.bottom = 'auto'; 
      floatingIcon.style.right = 'auto';
    }

    function stopDrag() {
        if(isDragging) {
            isDragging = false;
            floatingIcon.style.transition = 'transform 0.2s ease-out'; // Re-enable transition
            document.removeEventListener('mousemove', handleDrag);
        }
    }
  }

  /**
   * Sets up click handlers for the icon and document.
   */
  function setupClickHandlers() {
    if (!floatingIcon) return;
    
    // Need a flag to distinguish drag from click
    let dragHappened = false;
    floatingIcon.addEventListener('mousedown', () => { dragHappened = false; });
    floatingIcon.addEventListener('mousemove', () => { if(isDragging) dragHappened = true; });

    // Left click
    floatingIcon.addEventListener('click', (e) => {
      if (dragHappened) return; // Don't trigger click after drag
      e.stopPropagation();
      if (popupPanel && popupPanel.classList.contains('visible')) {
        hidePopup();
      } else {
        showPopup();
      }
    });

    // Right click
    floatingIcon.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Does nothing as requested
    });

    // Hide popup when clicking outside
    document.addEventListener('click', (e) => {
      if (popupPanel && popupPanel.classList.contains('visible')) {
        if (!popupPanel.contains(e.target) && e.target !== floatingIcon) {
          hidePopup();
        }
      }
    });
  }

  /**
   * Loads initial settings from storage.
   */
  function loadInitialSettings() {
    chrome.storage.local.get(['enabled', 'pattern'], (result) => {
      currentSettings.enabled = result.enabled !== undefined ? result.enabled : true;
      currentSettings.pattern = result.pattern || DEFAULT_PATTERN;
      updateIconAppearance();
    });
  }

  /**
   * Handles changes in chrome.storage.
   */
  function handleStorageChange(changes, area) {
    if (area === 'local') {
      let changed = false;
      if (changes.enabled !== undefined) {
        currentSettings.enabled = changes.enabled.newValue;
        changed = true;
      }
      if (changes.pattern !== undefined) {
        currentSettings.pattern = changes.pattern.newValue;
        // No visual change needed on icon for pattern change
      }
      if (changed) {
        updateIconAppearance();
        // If popup is visible, update its content
        if (popupPanel && popupPanel.classList.contains('visible')) {
           // Rebuild content to reflect change
           showPopup(); 
        }
      }
    }
  }
  
  /**
  * Simple HTML escaping
  */
  function escapeHtml(unsafe) {
      if (!unsafe) return '';
      return unsafe
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
   }

  // --- Initialization ---

  function initialize() {
    // Avoid running multiple times
    if (document.getElementById(ICON_ID)) {
        console.log('[DR Icon] Already initialized.');
        return;
    }
    console.log('[DR Icon] Initializing...');
    createIcon();
    createPopup();
    loadInitialSettings();
    // Listen for setting changes from other parts of the extension
    chrome.storage.onChanged.addListener(handleStorageChange);
  }

  // Run initialization
  // Use a timeout to avoid potential race conditions on complex pages
  // or conflicts with other scripts during initial load.
  setTimeout(initialize, 500); 

})(); // IIFE to avoid polluting global scope 