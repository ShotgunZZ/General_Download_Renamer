# PRD: General Download Renamer Chrome Extension (V1.0)

**1. Introduction**

This document outlines the requirements for a Chrome browser extension designed to automatically rename files downloaded through Chrome based on user-defined patterns. The goal is to provide users with more informative and consistently named downloaded files, improving organization and findability.

**2. Goals**

*   Automatically rename files downloaded via the Chrome browser upon completion.
*   Allow users to define a flexible renaming pattern using placeholders.
*   Improve the organization of users' download folders.
*   Provide a simple and intuitive configuration interface.
*   Operate reliably with minimal user intervention after initial setup.
*   Provide quick access to enable/disable and configure the extension via a floating icon on web pages.

**3. Target Audience**

*   Chrome users who frequently download files from various web sources.
*   Users who want better organization in their Downloads folder.
*   Individuals who prefer descriptive filenames over default server-provided names (e.g., `report.pdf`, `document(1).docx`).

**4. Features (V1.0)**

*   **Download Interception:**
    *   The extension must detect when a download is initiated via Chrome.
    *   It must reliably capture necessary metadata *before* the file is saved, including the source URL and the original suggested filename.
    *   *(Technical Note: Use `chrome.downloads.onDeterminingFilename` or `chrome.downloads.onCreated` combined with filename modification mechanisms).*

*   **Renaming Engine:**
    *   Apply a user-defined renaming pattern to the downloaded file's name.
    *   Support the following placeholders in the pattern:
        *   `{domain}`: The domain name of the download source (e.g., `example.com` from `https://www.example.com/path/file.zip`). Handle potential errors if the URL is not standard HTTP/S (e.g., `data:` URLs).
        *   `{timestamp}`: The date and time the download was *initiated* (e.g., `YYYY-MM-DD_HH-MM-SS`). The exact format should be configurable or default to a sortable format like `YYYYMMDD-HHMMSS`.
        *   `{date}`: The date part of the timestamp (e.g., `YYYY-MM-DD` or `YYYYMMDD`).
        *   `{time}`: The time part of the timestamp (e.g., `HH-MM-SS` or `HHMMSS`).
        *   `{originalFilename}`: The filename originally suggested by the server or browser (without the extension).
        *   `{ext}`: The original file extension (including the dot, e.g., `.pdf`).
    *   Combine placeholders and static text (e.g., `Invoice_{date}_{originalFilename}{ext}`).
    *   **Filename Sanitization:** Automatically remove characters that are invalid in filenames on common operating systems (e.g., `/ \ : * ? " < > |`). Replace them with a safe character like an underscore (`_`) or remove them.
    *   **Filename Conflict Handling:** If the generated filename already exists in the target download directory, automatically append a sequential number similar to Chrome's default behavior (e.g., `filename (1).ext`, `filename (2).ext`).

*   **Configuration (Options Page):**
    *   Provide a standard Chrome Extension Options page accessible via the extension list.
    *   **Pattern Builder:**
        *   Display available placeholders (`{domain}`, `{timestamp}`, `{date}`, `{time}`, `{originalFilename}`) as distinct draggable blocks.
        *   Provide a target area (drop zone) where users can drag these blocks to construct the desired filename format.
        *   Allow users to reorder blocks within the target area by dragging and dropping.
        *   Allow users to remove blocks from the target area.
        *   **Separator Selection:** Provide a dropdown menu allowing users to select a separator character (`_`, `.`, `-`, `*`, `x`, ` ` (space), `None` (no separator)) to be placed *between* each block in the sequence.
        *   The `{ext}` placeholder is *implicitly* appended to the end of the constructed pattern when saved; it is not displayed as a draggable block or affected by the separator.
    *   Include a toggle switch to easily enable/disable the overall renaming functionality.
    *   Provide a "Save Settings" button.
    *   Persist the constructed pattern *string* (e.g., `{date}{originalFilename}{ext}`), the selected `separator` character, and the `enabled` status using `chrome.storage.local`.
    *   Load the saved settings on page load and reconstruct the visual block arrangement and separator selection.
    *   Display a live preview of the filename format based on the current block sequence and selected separator.

*   **Floating Draggable Icon:**
    *   Inject a persistent, draggable icon (`icons/icon48.png`) onto web pages.
    *   **Left Click:** Opens a small popup menu visually similar to the original browser action popup. This menu will contain:
        *   A toggle switch to enable/disable renaming.
        *   A button/link to open the full Options page.
        *   A display of the current renaming pattern.
    *   **Right Click:** Does nothing (prevents default context menu).
    *   Icon appearance can be simple, no specific visual state indication (like ON/OFF text or glow) required for V1.0 based on this simplified approach.

**5. Technical Considerations**

*   **Platform:** Google Chrome Extension (Manifest V3).
*   **Permissions:** `downloads`, `storage`.
*   **APIs:** `chrome.downloads`, `chrome.storage`, `chrome.runtime`, HTML Drag and Drop API.
*   **Background Script:** Handles download listener, reads pattern string *and* separator from storage, calls pattern processing utility.
*   **Options Page:** HTML/CSS/JS implementing the drag-and-drop pattern builder UI, separator selection, and settings persistence.
*   **Utility Script (`utils/filenameUtils.js`):** The `processPattern` function needs modification to accept the separator and apply it between resolved placeholder values.
*   **Content Script:** Injects icon, handles dragging, handles icon clicks (left/right), creates and manages the icon's popup menu, interacts with `chrome.storage` to get/set state.

**6. Non-Goals (V1.0)**

*   Renaming files downloaded by applications *other* than Chrome.
*   Support for other browsers (Firefox, Safari, Edge).
*   Renaming files *already existing* in the Downloads folder (only handles new downloads).
*   Complex conditional logic in renaming patterns (e.g., different patterns based on file type or domain).
*   Syncing settings across multiple devices (can use `chrome.storage.sync` later if desired, but start with `local`).
*   Direct integration with specific webmail clients (this is a *general* downloader, unlike the previous project concept).
*   Static text separators in drag-and-drop UI.

**7. Future Considerations (Post V1.0)**

*   More advanced pattern options (regex replacements, substring extraction).
*   Conditional rules (e.g., different patterns for different domains or file types).
*   UI improvements (e.g., history of renamed files).
*   Option to choose timestamp format.
*   Option to configure conflict resolution behavior (overwrite, skip, number).
*   Syncing settings via `chrome.storage.sync`.
*   Customizable appearance for the floating icon (size, color, position memory).
*   Allowing static text/separators in pattern builder UI.
