# Changelog

All notable changes to General Download Renamer will be documented in this file.

## [1.1.0] - 2025-01-17

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
