# Task Breakdown: General Download Renamer Chrome Extension (V1.0)

Based on PRD.md, V1.0 (Updated for Floating Icon)

## Phase 1: Core Setup & Manifest

- [x] Create `manifest.json` for Manifest V3.
    - Define basic properties: `name`, `version`, `description`, `manifest_version`.
    - Request necessary permissions: `downloads`, `storage`.
    - Define background service worker: `background.service_worker`.
    - Define options page: `options_page`.
    - Define required icons (`icons` property).
- [x] Create placeholder icon files (`icons/icon16.png`, etc.).
- [x] Create basic `background/service-worker.js` file.
- [x] Create basic `options/options.html`, `options.css`, `options.js` files.

## Phase 2: Download Interception & Basic Renaming

- [x] Implement listener in `service-worker.js` for `chrome.downloads.onDeterminingFilename`.
- [x] Inside the listener, retrieve download metadata (URL, original filename).
- [x] Implement basic renaming logic (e.g., prefix with date).
    - Parse original filename and extension.
    - Construct a new filename based on a *hardcoded* simple pattern initially.
    - Suggest the new filename using the `suggest` callback.
- [x] Test basic renaming functionality.

## Phase 3: Options Page & Settings

- [x] Design basic UI in `options.html`:
    - Input field for the renaming pattern.
    - Toggle switch for enabling/disabling the extension.
    - Save button.
    - Display area for instructions/examples.
- [x] Implement `options.js` logic:
    - Load current settings (pattern, enabled status) from `chrome.storage.local` on page load.
    - Populate UI elements with loaded settings.
    - Save pattern and enabled status to `chrome.storage.local` when the save button is clicked.
    - Provide visual feedback on save.
- [x] Ensure `service-worker.js` reads the enabled status from storage before attempting to rename.

## Phase 4: Renaming Engine Enhancements

- [x] Read the user-defined pattern from `chrome.storage.local` in `service-worker.js`.
- [x] Implement placeholder replacement logic (domain, timestamp, date, time, originalFilename, ext) in `utils/filenameUtils.js`.
- [x] Implement filename sanitization (remove/replace invalid characters) in `utils/filenameUtils.js`.
- [x] Ensure background script uses the utilities for renaming.
- [x] Rely on Chrome's default conflict handling.

## Phase 5: Floating Icon & Popup Menu

- [ ] Create `content-scripts/floating-icon.css`:
    - Basic styling for the floating icon (fixed position, size, border-radius, cursor).
    - Styling for the popup menu triggered by the icon (mimic `popup.css` structure/theme).
- [ ] Create `content-scripts/floating-icon.js`:
    - Function to inject icon CSS.
    - Function to create icon element (div + img).
    - Function to create (initially hidden) popup panel element.
    - Function (`updatePopupContent`) to:
        - Read `enabled` and `pattern` from `chrome.storage.local`.
        - Build HTML for the popup menu (toggle, options button, pattern display).
        - Add event listeners to elements *within* the popup (toggle change saves to storage, options button opens options page).
    - Function (`showPopup`) to call `updatePopupContent`, position the panel near the icon, and make it visible.
    - Function (`hidePopup`) to hide the panel.
    - Basic dragging logic for the icon (`mousedown`, `mousemove`, `mouseup`).
    - Click handler for the icon (left-click calls `showPopup`, right-click does nothing).
    - Document click listener to call `hidePopup` if clicked outside the icon/popup.
    - Listener for `chrome.storage.onChanged` to update icon state/popup if visible.
    - Initialization logic to run on page load.
- [ ] Update `manifest.json` to include the content script.

## Phase 6: Refinement & Testing

- [ ] Add clear instructions and examples to `options.html`.
- [ ] Set a sensible default pattern if no pattern is saved in storage (`onInstalled` in background).
- [ ] Thoroughly test renaming with various sources, filenames, and edge cases.
- [ ] Test floating icon dragging and popup menu functionality (enable/disable toggle, options link).
- [ ] Test interaction between popup/options page and storage.
- [ ] Review code for clarity, error handling, and adherence to standards.
- [ ] Add JSDoc comments where needed. 