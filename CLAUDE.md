# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

No build scripts are defined. This is a Chrome extension that runs directly from source files:

- **Testing**: Load the extension in Chrome Developer Mode by pointing to the project root directory
- **Packaging**: Use `chrome://extensions/` Developer Mode to pack the extension, or zip the contents manually
- **Dependencies**: Run `npm install` to install the single dependency (canvas for thumbnail generation)

## Architecture Overview

This is a **Manifest V3 Chrome Extension** that automatically renames downloaded files based on user-defined patterns.

### Core Components

1. **Background Service Worker** (`background/service-worker.js`)
   - Intercepts downloads via `chrome.downloads.onDeterminingFilename`
   - Processes filename patterns using utilities from `utils/filenameUtils.js`
   - Manages extension state through `chrome.storage.local`

2. **Content Script** (`content-scripts/floating-icon.js`)
   - Injects a draggable floating icon on all web pages
   - Provides quick toggle functionality and access to options
   - Communicates with background script for settings

3. **Options Page** (`options/options.html`)
   - Drag-and-drop pattern builder interface
   - Manages filename patterns and separators
   - Uses `chrome.storage.local` for persistence

4. **Filename Utilities** (`utils/filenameUtils.js`)
   - Core pattern processing logic (`processPattern`)
   - Placeholder replacement system (domain, date, time, originalFilename, etc.)
   - Filename sanitization for cross-platform compatibility

### Key Data Flow

1. User configures pattern in Options page → Saved to `chrome.storage.local`
2. Download initiated → Background service worker intercepts
3. Pattern processed with current context (URL, date/time) → New filename suggested
4. Floating icon reflects current enabled/disabled state

### Pattern System

The extension uses a placeholder-based pattern system:
- `{domain}` - Source domain (e.g., google.com)
- `{date}` - YYYYMMDD format
- `{time}` - HHMMSS format
- `{timestamp}` - YYYYMMDD-HHMMSS format
- `{originalFilename}` - Original name without extension
- `{ext}` - File extension (automatically appended)

Patterns are stored without separators, which are applied during processing via the `processPattern` function.

## Technical Standards

- **ES6+ JavaScript** with modules (service worker uses ES modules)
- **Manifest V3** Chrome Extension APIs
- **Functional programming** approach preferred
- **camelCase** for variables, **PascalCase** for components
- Always include error handling with try/catch blocks
- Use `console.log` for debugging (extension logs visible in Chrome DevTools)

## Storage Schema

Settings stored in `chrome.storage.local`:
```javascript
{
  enabled: boolean,        // Extension on/off state
  pattern: string,         // Placeholder pattern (e.g., "{date}{originalFilename}{ext}")
  separator: string        // Separator between pattern elements
}
```

## Development Notes

- The floating icon loads with a 500ms delay to avoid conflicts with page scripts
- Pattern processing excludes `{ext}` from separator logic (extension is always appended)
- File sanitization removes invalid filename characters: `\/\\:*?"<>|`
- Storage changes are reactive - UI updates automatically when settings change
- Extension works ~95% of the time due to Chrome's download interception timing