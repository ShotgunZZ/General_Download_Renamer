# PRD: General Download Renamer Chrome Extension (V1.0)

**1. Introduction**

This document outlines the requirements for a Chrome browser extension designed to automatically rename files downloaded through Chrome based on user-defined patterns. The goal is to provide users with more informative and consistently named downloaded files, improving organization and findability.

**2. Goals**

*   Automatically rename files downloaded via the Chrome browser upon completion (or suggest the name beforehand).
*   Allow users to define a flexible renaming pattern using placeholders.
*   Improve the organization of users' download folders.
*   Provide a simple and intuitive configuration interface.
*   Operate reliably with minimal user intervention after initial setup.

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

*   **Configuration:**
    *   Provide a standard Chrome Extension Options page.
    *   Allow users to input and save their desired renaming pattern string.
    *   Display clear instructions and examples of how to use placeholders.
    *   Include a toggle switch to easily enable/disable the renaming functionality.
    *   Persist the user's settings using `chrome.storage.local` or `chrome.storage.sync`.
    *   Provide a sensible default pattern (e.g., `{date}_{originalFilename}{ext}` or `{domain}_{originalFilename}{ext}`).

**5. Technical Considerations**

*   **Platform:** Google Chrome Extension (Manifest V3).
*   **Permissions:** `downloads` (required), `storage` (required for saving settings).
*   **APIs:** `chrome.downloads`, `chrome.storage`.
*   **Background Script:** Logic for listening to downloads and applying renaming rules.
*   **Options Page:** Simple HTML/CSS/JS page for configuration.

**6. Non-Goals (V1.0)**

*   Renaming files downloaded by applications *other* than Chrome.
*   Support for other browsers (Firefox, Safari, Edge).
*   Renaming files *already existing* in the Downloads folder (only handles new downloads).
*   Complex conditional logic in renaming patterns (e.g., different patterns based on file type or domain).
*   Syncing settings across multiple devices (can use `chrome.storage.sync` later if desired, but start with `local`).
*   Providing a browser action popup (can be added later).
*   Direct integration with specific webmail clients (this is a *general* downloader, unlike the previous project concept).

**7. Future Considerations (Post V1.0)**

*   More advanced pattern options (regex replacements, substring extraction).
*   Conditional rules (e.g., different patterns for different domains or file types).
*   UI improvements (e.g., a popup for quick enable/disable, history of renamed files).
*   Option to choose timestamp format.
*   Option to configure conflict resolution behavior (overwrite, skip, number).
*   Syncing settings via `chrome.storage.sync`.
