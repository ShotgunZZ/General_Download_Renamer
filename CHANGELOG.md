# Changelog

All notable changes to General Download Renamer will be documented in this file.

## [1.2.0] - 2026-01-25

### 🎆 Major New Features
- **Custom Placeholders**: Create user-defined placeholders derived from existing ones using regex and keyword gating
  - Define placeholders with regex patterns containing one capture group
  - Optional keyword filtering to gate when regex runs
  - Supports deriving from any base placeholder (domain, tabUrl, sourceUrl, etc.)
- **New URL Placeholders**: Access to download and referrer URLs
  - `{sourceUrl}`: Full download source URL
  - `{tabUrl}`: Referrer/tab URL when available
- **Enhanced Floating Preview**: Shows both current pattern and preview with resolved values
  - Current pattern displays raw placeholder format
  - Preview pattern shows immediately resolvable values (domain, date, time, timestamp, tabUrl)
  - Download-time placeholders remain as `{placeholder}` in preview

### ✨ Enhancements
- **Smart Filename Joining**: Empty placeholders are skipped during filename construction to prevent extra separators
- **Improved Popup Positioning**: Better floating icon popup placement with viewport boundaries
- **Enhanced UI**: Wider, scrollable popup with better word wrapping (340px, max 90vw x 70vh)
- **Custom Placeholders Management**: Full UI for adding, editing, and deleting custom placeholder rules
- **Dynamic Placeholder Updates**: Available placeholders update automatically when custom placeholders are added

### 🔧 Technical Improvements
- Enhanced `processPattern()` to skip empty/null placeholder values
- Custom placeholder processing in service worker with keyword gating logic
- Preview resolution logic in floating icon for immediate feedback
- Grid-based UI layout for custom placeholder rules (Name, Base, Regex, Keywords)
- Improved drag/click handling in floating icon

### 📖 Documentation
- Added custom placeholders section to README with examples
- Documented Jira ID extraction use case
- Updated placeholder descriptions with new URL placeholders
- Added notes on preview limitations

### Example Use Cases
- Extract Jira issue keys from URLs: `{jira_id}_{originalFilename}{ext}`
- Use product IDs from download URLs in filenames
- Extract project codes from tab URLs for automatic organization

## [1.1.1] - 2025-11-04

### 🐛 Bug Fixes
- **Fixed floating icon synchronization**: Floating icon now updates immediately across all tabs without requiring page reload
- **Fixed hide button behavior**: Clicking the × hide button now properly syncs with options page toggle
- **Removed invalid manifest key**: Removed `privacy_practices` field that caused manifest warnings

### ✨ Enhancements
- **Options page toggle**: Added "Show Floating Icon" toggle in options page header for easy visibility control
- **Real-time synchronization**: All floating icon visibility changes now sync instantly across all tabs and windows
- **Improved storage listeners**: Enhanced `chrome.storage.onChanged` handling for better cross-component communication
- **Simplified codebase**: Removed redundant tab messaging code, now relies entirely on Chrome's storage propagation

### 🔧 Technical Improvements
- Enhanced `handleStorageChange()` in content script to listen for `showFloatingIcon` changes
- Added `handleOptionsStorageChange()` in options page for bidirectional sync
- Removed invalid `chrome.tabs` API usage from content scripts
- Streamlined toggle handler to use storage-only synchronization

## [1.1.0] - 2025-07-17

### 🎆 Major New Features
- **Custom Categories System**: Complete file categorization management
- **New `{category}` Placeholder**: Automatically categorize downloads based on file extensions
- **Category Management UI**: Full CRUD operations for category rules
- **11 Built-in Categories**: Comprehensive default categories covering most file types
- **Reset to Defaults**: One-click restore to original category settings

### ✨ Enhancements
- **Real-time Validation**: Input validation with visual feedback for category rules
- **Auto-save**: Category changes save instantly without manual save button
- **Persistent Storage**: All customizations survive browser restarts
- **Backward Compatibility**: All v1.0 functionality preserved

### 📁 Default Categories Added
- Documents (pdf, doc, docx, odt, rtf, txt, md)
- Spreadsheets (xls, xlsx, csv, ods, xml)
- Presentations (ppt, pptx, odp)
- Images (jpg, jpeg, png, gif, bmp, svg, webp, heic, heif)
- Design & RAW (psd, ai, eps, indd, sketch, fig, cr2, nef, arw, dng)
- Audio (mp3, wav, aac, flac, m4a, ogg)
- Videos (mp4, mov, avi, mkv, wmv, flv, webm)
- Archives (zip, rar, 7z, tar, gz, bz2)
- Code (html, css, js, json, py, java, cpp, sh, ps1)
- Installers (exe, dmg, pkg, msi, deb, app)
- Fonts (ttf, otf, woff, woff2)

### 🔧 Technical Improvements
- Enhanced storage schema for category rules
- Real-time background script updates
- Comprehensive input validation
- Error handling and user feedback
- Case-insensitive extension matching

### 📖 Documentation
- Updated README with v1.1 features
- Added upgrade notes and migration guide
- Enhanced usage examples with categories
- Created comprehensive changelog

## [1.0.0] - 2024-12-XX

### 🚀 Initial Release
- **Automatic Download Renaming**: Intercept and rename downloads based on custom patterns
- **Visual Pattern Builder**: Drag-and-drop interface for creating filename patterns
- **Smart Placeholders**: Support for domain, date, time, timestamp, originalFilename, and ext
- **Custom Separators**: Choose how filename parts are joined
- **Floating Icon Toggle**: Quick enable/disable on any webpage
- **Options Page**: Comprehensive settings management
- **Chrome Extension**: Full Manifest V3 compatibility
- **Safe Filename Handling**: Automatic sanitization and conflict resolution

### 🛠️ Core Features
- Background service worker for download interception
- Content script for floating icon functionality
- Options page with pattern builder interface
- Chrome storage integration for settings persistence
- Real-time pattern preview
- Extension enable/disable toggle

---

## Version Format
This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.1.0)
- **MAJOR**: Breaking changes or major new features
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible
