# Task Breakdown: General Download Renamer Chrome Extension (V1.0)

Based on PRD.md, V1.0

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

- [ ] Implement listener in `service-worker.js` for `chrome.downloads.onDeterminingFilename`.
- [ ] Inside the listener, retrieve download metadata (URL, original filename).
- [ ] Implement basic renaming logic (e.g., prefix with date).
    - Parse original filename and extension.
    - Construct a new filename based on a *hardcoded* simple pattern initially.
    - Suggest the new filename using the `suggest` callback.
- [ ] Test basic renaming functionality.

## Phase 3: Options Page & Settings

- [ ] Design basic UI in `options.html`:
    - Input field for the renaming pattern.
    - Toggle switch for enabling/disabling the extension.
    - Save button.
    - Display area for instructions/examples.
- [ ] Implement `options.js` logic:
    - Load current settings (pattern, enabled status) from `chrome.storage.local` on page load.
    - Populate UI elements with loaded settings.
    - Save pattern and enabled status to `chrome.storage.local` when the save button is clicked.
    - Provide visual feedback on save.
- [ ] Ensure `service-worker.js` reads the enabled status from storage before attempting to rename.

## Phase 4: Renaming Engine Enhancements

- [ ] Read the user-defined pattern from `chrome.storage.local` in `service-worker.js`.
- [ ] Implement placeholder replacement logic:
    - `{domain}` (handle potential URL parsing errors).
    - `{timestamp}` (use a consistent format, e.g., `YYYYMMDD-HHMMSS`).
    - `{date}`.
    - `{time}`.
    - `{originalFilename}`.
    - `{ext}`.
- [ ] Implement filename sanitization (remove/replace invalid characters like `/ \ : * ? " < > |`). Consider creating a utility function in `utils/filenameUtils.js`.
- [ ] Implement filename conflict handling (append ` (1)`, ` (2)`, etc. if the file exists). This is the default behavior of `suggest`, but needs verification, especially if the target directory changes.

## Phase 5: Refinement & Testing

- [ ] Add clear instructions and examples to `options.html`.
- [ ] Set a sensible default pattern if no pattern is saved in storage.
- [ ] Thoroughly test with various download sources, filenames, and edge cases (e.g., `data:` URLs, files with no extension, very long filenames).
- [ ] Test enabling/disabling functionality.
- [ ] Test conflict handling.
- [ ] Review code for clarity, error handling, and adherence to standards.
- [ ] Add JSDoc comments where needed. 