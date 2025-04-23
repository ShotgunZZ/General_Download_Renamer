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

- [ ] Design UI in `options.html`:
    - Remove text input for pattern.
    - Create a container for available placeholder blocks (`#available-blocks`).
    - Create a container for the user-built pattern (`#pattern-sequence`).
    - Add a dropdown (`#separator-select`) for choosing separators (`_`, `.`, `-`, `*`, `x`, ` ` (space), `None` (value="")).
    - Keep the toggle switch for enabling/disabling the extension.
    - Keep the Save button.
- [ ] Style UI in `options.css`:
    - Style the available blocks container and the pattern sequence container.
    - Style the individual draggable blocks.
    - Style the separator dropdown and its label.
    - Add visual cues for dragging (e.g., `dragging` class, `drag-over` class on target).
- [ ] Implement `options.js` logic:
    - **Load:**
        - Load `enabled` status and set toggle switch.
        - Load saved `pattern` string.
        - Load saved `separator` and set dropdown value (default if needed).
        - Define available placeholders: `[\'domain\', \'timestamp\', \'date\', \'time\', \'originalFilename\']`.
        - Populate `#available-blocks` with draggable elements for each placeholder.
        - Parse the loaded pattern string (using regex `/\{([^}]+)\}/g`, ignore `{ext}`) and create corresponding blocks in `#pattern-sequence`.
        - Call `updatePreview()` after loading.
    - **Drag/Drop:**
        - Add `dragstart` listeners to blocks in `#available-blocks`.
        - Add `dragover` and `drop` listeners to `#pattern-sequence` to handle dropping *new* blocks.
        - When dropping, create a *clone* of the block in the target, add necessary attributes/listeners (including making it draggable for reordering and adding a remove button).
        - Implement reordering *within* `#pattern-sequence` using drag/drop on the contained blocks.
        - Add event listeners to remove buttons on blocks in `#pattern-sequence`.
    - **Separator Change:**
        - Add `change` listener to `#separator-select` that calls `updatePreview()`.
    - **Preview Update (`updatePreview`):**
        - Get the current separator value from the dropdown.
        - Get the sequence of blocks.
        - Join the block text content using the selected separator.
        - Update the preview text span.
    - **Save:**
        - On save button click, read the `data-placeholder` attribute from blocks in `#pattern-sequence` in order.
        - Construct the pattern string by joining them: `{p1}{p2}...`.
        - Append `{ext}` to the string.
        - Get the selected separator value.
        - Save the constructed `pattern` string, the `enabled` status, and the `separator` to `chrome.storage.local`.
        - Provide visual feedback on save.

## Phase 4: Floating Icon & Popup Menu

- [x] Create `content-scripts/floating-icon.css` (Styles already created).
- [x] Create `content-scripts/floating-icon.js` (Functionality already implemented).
- [x] Update `manifest.json` to include the content script (Done).

## Phase 5: Background Script Separator Logic

- [ ] Modify `utils/filenameUtils.js`:
    - Update `processPattern` function to accept `separator` as an argument.
    - Inside `processPattern`, after replacing placeholders, join the results using the provided separator.
- [ ] Modify `background/service-worker.js`:
    - Load `separator` setting from storage during initialization and on change.
    - Pass the loaded `separator` value to `processPattern` within the `processDownload` function.

## Phase 6: Refinement & Testing

- [ ] Set sensible defaults (`pattern`, `separator`, `enabled`) if no settings are saved (`onInstalled` in background).
- [ ] Thoroughly test renaming with various sources, filenames, edge cases, and different separators (including 'None').
- [ ] Test floating icon dragging and popup menu functionality.
- [ ] Test options page drag-and-drop and separator selection thoroughly.
- [ ] Test interaction between popup/options page and storage.
- [ ] Review code for clarity, error handling, and adherence to standards.
- [ ] Add JSDoc comments where needed. 