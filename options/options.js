/**
 * Options page script for the General Download Renamer extension
 * Handles drag-and-drop pattern building and settings persistence.
 */
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const saveButton = document.getElementById('save-btn');
  const statusMessage = document.getElementById('status-message');
  const availableBlocksList = document.getElementById('available-blocks-list');
  const patternSequence = document.getElementById('pattern-sequence');
  const patternPreviewText = document.getElementById('pattern-preview-text');
  const placeholderText = patternSequence.querySelector('.placeholder-text');
  const placeholderDescriptionsList = document.querySelector('#placeholder-descriptions ul');
  const separatorSelect = document.getElementById('separator-select');

  // --- Constants ---
  const DEFAULT_PATTERN = '{date}{originalFilename}{ext}';
  const DEFAULT_SEPARATOR = '_';
  // Store placeholders with their descriptions
  const PLACEHOLDERS_INFO = {
    'domain': 'The domain name of the download source',
    'timestamp': 'Full date and time (YYYYMMDD-HHMMSS)',
    'date': 'Date only (YYYYMMDD)',
    'time': 'Time only (HHMMSS)',
    'originalFilename': 'The original filename without extension'
  };
  const PLACEHOLDERS = Object.keys(PLACEHOLDERS_INFO);
  let currentlyDraggedItem = null;
  let currentSettings = { pattern: DEFAULT_PATTERN, separator: DEFAULT_SEPARATOR };

  // --- Functions ---

  /**
   * Creates a draggable placeholder block.
   * @param {string} placeholder - The placeholder name (e.g., 'date').
   * @param {boolean} isInSequence - If true, adds a remove button.
   * @returns {HTMLElement} The created block element.
   */
  function createBlock(placeholder, isInSequence = false) {
    const block = document.createElement('div');
    block.className = 'placeholder-block';
    block.textContent = `{${placeholder}}`;
    block.dataset.placeholder = placeholder;
    block.draggable = true;
    // block.title = PLACEHOLDERS_INFO[placeholder] || 'Placeholder block'; // Remove title tooltip
    
    block.addEventListener('dragstart', handleDragStart);
    block.addEventListener('dragend', handleDragEnd);

    if (isInSequence) {
      addRemoveButton(block);
      // Blocks in the sequence also need drop handling for reordering
      block.addEventListener('dragover', handleDragOverBlock);
      block.addEventListener('drop', handleDropOnBlock);
    }
    
    return block;
  }

  /**
   * Adds a remove button to a block in the sequence.
   * @param {HTMLElement} block - The block element.
   */
  function addRemoveButton(block) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-block-btn';
    removeBtn.innerHTML = '&times;'; // Use HTML entity for 'x'
    removeBtn.title = 'Remove block';
    removeBtn.addEventListener('click', () => {
      block.remove();
      updatePreview();
      checkPlaceholderVisibility();
      populateAvailableBlocks(); // Ensure this is called to repopulate available list
    });
    block.appendChild(removeBtn);
  }

  /**
   * Populates the list of available placeholder blocks, 
   * excluding any that are already in the current pattern sequence.
   */
  function populateAvailableBlocks() {
    availableBlocksList.innerHTML = ''; // Clear existing
    const sequencePlaceholders = Array.from(patternSequence.querySelectorAll('.placeholder-block'))
                                     .map(block => block.dataset.placeholder);

    PLACEHOLDERS.forEach(p => {
      // Only add if NOT already in the sequence
      if (!sequencePlaceholders.includes(p)) {
        const block = createBlock(p, false); // Create block without remove button for available list
        availableBlocksList.appendChild(block);
      }
    });
  }

  /**
   * Populates the placeholder descriptions list.
   */
  function populateDescriptions() {
      if (!placeholderDescriptionsList) return;
      placeholderDescriptionsList.innerHTML = ''; // Clear existing
      PLACEHOLDERS.forEach(p => {
          const li = document.createElement('li');
          const description = PLACEHOLDERS_INFO[p] || 'No description available.';
          li.innerHTML = `<code>{${p}}</code> - ${description}`;
          placeholderDescriptionsList.appendChild(li);
      });
  }

  /**
   * Loads settings from storage and populates the UI.
   */
  function loadSettings() {
    chrome.storage.local.get(['pattern', 'separator'], (result) => {
      currentSettings.pattern = result.pattern || DEFAULT_PATTERN;
      currentSettings.separator = result.separator !== undefined ? result.separator : DEFAULT_SEPARATOR;

      separatorSelect.value = currentSettings.separator;
      
      // Clear current sequence
      patternSequence.innerHTML = '';
      
      // Reconstruct sequence from saved pattern
      const savedPlaceholders = (currentSettings.pattern.match(/\{([^}]+)\}/g) || [])
        .map(p => p.slice(1, -1))
        .filter(p => p !== 'ext');

      savedPlaceholders.forEach(p => {
        if (PLACEHOLDERS.includes(p)) {
           const block = createBlock(p, true);
           patternSequence.appendChild(block);
        }
      });
      
      updatePreview();
      checkPlaceholderVisibility();
      
      // Populate available blocks *after* building the sequence
      populateAvailableBlocks(); 
      
      // Ensure all blocks loaded from settings have remove buttons
      ensureRemoveButtons();
    });
  }
  
  /**
   * Updates the preview text based on the current sequence and selected separator.
   */
  function updatePreview() {
    const blocks = Array.from(patternSequence.querySelectorAll('.placeholder-block'));
    const separator = separatorSelect.value; 
    // Reconstruct preview from dataset to avoid including button text
    const preview = blocks
        .map(b => `{${b.dataset.placeholder}}`) 
        .join(separator); 
    patternPreviewText.textContent = preview;
  }

  /**
   * Shows/hides the 'Drop blocks here' placeholder text.
   */
  function checkPlaceholderVisibility() {
      if (patternSequence.querySelector('.placeholder-block')) {
          if(placeholderText) placeholderText.style.display = 'none';
      } else {
          if(!placeholderText) { // Create if it doesn't exist
             const span = document.createElement('span');
             span.className = 'placeholder-text';
             span.textContent = 'Drop blocks here';
             patternSequence.appendChild(span);
          } else {
             placeholderText.style.display = 'block';
          }
      }
  }

  /**
   * Saves the current settings (constructed pattern, separator).
   */
  function saveSettings() {
    const blocks = Array.from(patternSequence.querySelectorAll('.placeholder-block'));
    const patternPlaceholders = blocks.map(b => `{${b.dataset.placeholder}}`).join('');
    const finalPattern = patternPlaceholders + '{ext}';
    const separator = separatorSelect.value;

    chrome.storage.local.set({ 
      pattern: finalPattern,
      separator: separator
    }, () => {
      currentSettings.pattern = finalPattern;
      currentSettings.separator = separator;
      showStatusMessage('Settings saved!');
    });
  }

  /**
   * Displays a status message for a short duration.
   * @param {string} message - The message to display.
   */
  function showStatusMessage(message) {
    statusMessage.textContent = message;
    statusMessage.style.opacity = '1';
    setTimeout(() => { statusMessage.style.opacity = '0'; }, 2000);
  }

  // --- Drag and Drop Event Handlers ---

  function handleDragStart(e) {
    currentlyDraggedItem = e.target;
    e.dataTransfer.setData('text/plain', e.target.dataset.placeholder);
    e.target.classList.add('dragging');
    if(placeholderText) placeholderText.style.display = 'none'; // Hide placeholder during drag
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    currentlyDraggedItem = null;
    checkPlaceholderVisibility(); // Show placeholder if sequence is empty
  }

  function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    patternSequence.classList.add('drag-over');
  }

  function handleDragLeave() {
    patternSequence.classList.remove('drag-over');
  }

  /**
   * Ensures all blocks in the pattern sequence have remove buttons.
   * Can be called after any drag/drop operation to fix inconsistencies.
   */
  function ensureRemoveButtons() {
    const sequenceBlocks = patternSequence.querySelectorAll('.placeholder-block');
    
    sequenceBlocks.forEach(block => {
      // Check if the block already has a remove button
      if (!block.querySelector('.remove-block-btn')) {
        addRemoveButton(block);
        
        // Also ensure the block has drag handling for reordering
        if (!block.hasAttribute('data-has-drop-handlers')) {
          block.addEventListener('dragover', handleDragOverBlock);
          block.addEventListener('drop', handleDropOnBlock);
          block.setAttribute('data-has-drop-handlers', 'true');
        }
      }
    });
  }

  function handleDropOnSequence(e) {
    e.preventDefault();
    patternSequence.classList.remove('drag-over');
    const placeholder = e.dataTransfer.getData('text/plain');
    
    // Ensure we have a valid placeholder and the dragged item exists
    if (!placeholder || !PLACEHOLDERS.includes(placeholder) || !currentlyDraggedItem) {
        return;
    }

    const sourceList = currentlyDraggedItem.parentNode;

    // Scenario 1: Dragging from Available list to Sequence container
    if (sourceList === availableBlocksList) {
        // Create a new block specifically for the sequence, with a remove button
        const newBlockInSequence = createBlock(placeholder, true); 
        patternSequence.appendChild(newBlockInSequence);

        // Remove the original block that was dragged from the available list
        currentlyDraggedItem.remove();
        
        updatePreview();
        checkPlaceholderVisibility();
    } 
    // Scenario 2: Reordering within Sequence (dropping onto the container itself, not another block)
    else if (sourceList === patternSequence) {
        // Just append the block being dragged (it should already have its remove button)
        patternSequence.appendChild(currentlyDraggedItem);
        updatePreview(); // Update preview after reorder
    }
    
    // Ensure all blocks in the sequence have remove buttons
    ensureRemoveButtons();
  }
  
  // Handlers for reordering *within* the sequence
  function handleDragOverBlock(e) {
      e.preventDefault(); 
      // Optional: add visual indication on the block being hovered over
  }

  function handleDropOnBlock(e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent drop event bubbling to parent container
      
      if (!currentlyDraggedItem || currentlyDraggedItem === e.target) {
          return; // Can't drop on itself
      }

      // Insert the dragged item before the target item
      patternSequence.insertBefore(currentlyDraggedItem, e.target.closest('.placeholder-block'));
      updatePreview();
      
      // Ensure all blocks have remove buttons after reordering
      ensureRemoveButtons();
  }

  // --- Initialization ---
  populateAvailableBlocks();
  populateDescriptions(); // Populate the descriptions area
  loadSettings(); // Load saved settings and build initial sequence
  saveButton.addEventListener('click', saveSettings);
  
  // Add drag listeners to the main drop zone
  patternSequence.addEventListener('dragover', handleDragOver);
  patternSequence.addEventListener('dragleave', handleDragLeave);
  patternSequence.addEventListener('drop', handleDropOnSequence);
  
  // Add change listener to the separator dropdown
  separatorSelect.addEventListener('change', updatePreview);
  
}); 