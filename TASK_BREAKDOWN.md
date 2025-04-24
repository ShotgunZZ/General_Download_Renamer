# Task Breakdown: General Download Renamer Chrome Extension (V1.0)

Based on PRD.md, V1.0 (Updated for Floating Icon & DND Options)

## Phase 1: Core Setup & Manifest

- [x] Create `manifest.json` for Manifest V3.
    - Define basic properties: `name`, `version`, `description`, `manifest_version`.
    - Request necessary permissions: `downloads`, `storage`.
    - Define background service worker: `background.service_worker`.
    - Define options page: `options_page`.
    - Define required icons (`icons` property).
- [x] Create placeholder icon files (`icons/icon16.png`, etc.).
- [x] Create basic `background/service-worker.js` file.
- [x] Create basic `options/options.html`, `options.css`, `options.js` files (placeholders for now).

## Phase 2: Download Interception & Renaming Engine

- [x] Implement listener in `service-worker.js` for `chrome.downloads.onDeterminingFilename`.
- [x] Implement placeholder replacement logic (domain, timestamp, date, time, originalFilename, ext) in `utils/filenameUtils.js`.
- [x] Implement filename sanitization in `utils/filenameUtils.js`.
- [x] Ensure background script uses the utilities and respects the `enabled` status from `chrome.storage.local`.
- [x] Rely on Chrome's default conflict handling.

## Phase 3: Options Page - Drag-and-Drop UI & Separator

- [x] Design UI in `options.html`:
    - [x] Remove text input for pattern.
    - [x] Create a container for available placeholder blocks (`#available-blocks`).
    - [x] Create a container for the user-built pattern (`#pattern-sequence`).
    - [x] Add a dropdown (`#separator-select`) for choosing separators (`_`, `.`, `-`, `*`, `x`, ` ` (space), `None` (value="")).
    - [x] Remove the toggle switch for enabling/disabling the extension (per user request).
    - [x] Keep the Save button.
- [x] Style UI in `options.css`:
    - [x] Style the available blocks container and the pattern sequence container.
    - [x] Style the individual draggable blocks.
    - [x] Style the separator dropdown and its label.
    - [x] Add visual cues for dragging (e.g., `dragging` class, `drag-over` class on target).
- [x] Implement `options.js` logic:
    - **Load:**
        - [x] Load saved `pattern` string.
        - [x] Load saved `separator` and set dropdown value (default if needed).
        - [x] Define available placeholders: `['domain', 'timestamp', 'date', 'time', 'originalFilename']`.
        - [x] Populate `#available-blocks` with draggable elements for each placeholder.
        - [x] Parse the loaded pattern string (using regex `/\{([^}]+)\}/g`, ignore `{ext}`) and create corresponding blocks in `#pattern-sequence`.
        - [x] Call `updatePreview()` after loading.
    - **Drag/Drop:**
        - [x] Add `dragstart` listeners to blocks in `#available-blocks`.
        - [x] Add `dragover` and `drop` listeners to `#pattern-sequence` to handle dropping *new* blocks.
        - [x] When dropping, create a *clone* of the block in the target, add necessary attributes/listeners (including making it draggable for reordering and adding a remove button).
        - [x] Implement reordering *within* `#pattern-sequence` using drag/drop on the contained blocks.
        - [x] Add event listeners to remove buttons on blocks in `#pattern-sequence`.
        - [x] Fix bugs with missing remove buttons and placeholder synchronization between available and sequence lists.
    - **Separator Change:**
        - [x] Add `change` listener to `#separator-select` that calls `updatePreview()`.
    - **Preview Update (`updatePreview`):**
        - [x] Get the current separator value from the dropdown.
        - [x] Get the sequence of blocks.
        - [x] Join the block text content using the selected separator.
        - [x] Update the preview text span.
    - **Save:**
        - [x] On save button click, read the `data-placeholder` attribute from blocks in `#pattern-sequence` in order.
        - [x] Construct the pattern string by joining them: `{p1}{p2}...`.
        - [x] Append `{ext}` to the string.
        - [x] Get the selected separator value.
        - [x] Save the constructed `pattern` string and the `separator` to `chrome.storage.local`.
        - [x] Provide visual feedback on save.

## Phase 4: Floating Icon & Popup Menu

- [x] Create `content-scripts/floating-icon.css` (Styles already created).
- [x] Create `content-scripts/floating-icon.js` (Functionality already implemented).
- [x] Update `manifest.json` to include the content script (Done).

## Phase 5: Background Script Separator Logic

- [x] Modify `utils/filenameUtils.js`:
    - [x] Update `processPattern` function to accept `separator` as an argument.
    - [x] Inside `processPattern`, after replacing placeholders, join the results using the provided separator.
- [x] Modify `background/service-worker.js`:
    - [x] Load `separator` setting from storage during initialization and on change.
    - [x] Load `enabled` flag (managed solely by the floating icon popup, not the options page). 
    - [x] Pass the loaded `separator` value to `processPattern` within the `processDownload` function.
    - [x] Only process downloads when `enabled` is true.

## Phase 6: Refinement & Testing

- [x] Set sensible defaults (`pattern`, `separator`, `enabled`) if no settings are saved (`onInstalled` in background).
- [ ] Thoroughly test renaming with various sources, filenames, edge cases, and different separators (including 'None').
- [ ] Test floating icon dragging and popup menu functionality.
- [ ] Test options page drag-and-drop and separator selection thoroughly.
- [ ] Test interaction between popup/options page and storage.
- [ ] Review code for clarity, error handling, and adherence to standards.
- [ ] Add JSDoc comments where needed. 