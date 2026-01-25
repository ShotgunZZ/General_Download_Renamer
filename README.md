# General Download Renamer

## Take Control of Your Downloads!

Are you tired of your Downloads folder becoming a disorganized graveyard of files with meaningless names like `FINAL_FINAL_REALLY_FINAL_v3.pdf` or `Screenshot_WhatIsThis_20230614.png`? General Download Renamer solves this problem by automatically renaming your downloads based on patterns YOU define!

![General Download Renamer](icons/icon128.png)

## 🚀 Install

**[Install from Chrome Web Store](https://chromewebstore.google.com/detail/pbjlahgadmnhacddhincanlcffjjjclb?utm_source=item-share-cb)**

## ✨ Key Features

- **Automatic Renaming:** Intercepts downloads and applies your custom naming rules instantly
- **Visual Pattern Builder:** Create filename formats with a drag-and-drop interface
- **Smart Placeholders:** Use variables like:
  - `{domain}` (e.g., `google.com`)
  - `{sourceUrl}` (the full download URL)
  - `{tabUrl}` (the referrer/tab URL when available)
  - `{originalFilename}` (the name the server suggested)
  - `{date}` (YYYY-MM-DD)
  - `{time}` (HH-MM-SS)
  - `{timestamp}` (YYYY-MM-DD_HH-MM-SS)
  - `{category}` **NEW!** Auto-detected file category (Documents, Images, etc.)
  - `{ext}` (the file extension)
- **🆕 Custom Placeholders (v1.2):** Derive new placeholders from existing ones using keywords gating and a regex with a single capture group; if matched, the value is `match[1]`.
- **Custom Categories:** Define your own file categorization rules!
  - 11 built-in categories (Documents, Images, Videos, Audio, Code, etc.)
  - Add, edit, and delete custom categories
  - Real-time validation and auto-save
  - Reset to defaults anytime
- **Custom Separators:** Choose how filename parts are joined (_, -, ., space, none)
- **Quick Toggle:** Enable/disable via a floating icon on any webpage
- **Safe & Reliable:** Automatically sanitizes filenames and handles naming conflicts
- **Floating Preview:** The floating panel shows both Current pattern and a Preview pattern with immediately resolvable values (e.g., domain/date/time/timestamp/tabUrl).

## 🛠️ Usage

1. After installation, click the extension icon in your toolbar
2. Visit the Options page to set up your custom renaming pattern
3. Use the drag-and-drop interface to build your ideal filename format
4. **Optional:** Customize file categories in the "File Categories" section
   - Edit existing categories or add your own
   - Use the `{category}` placeholder in your patterns
   - Example: `{category}/{originalFilename}` → `Documents/report.pdf`
5. **NEW in v1.2:** Create custom placeholders to extract data from URLs or filenames
   - Perfect for Jira IDs, product codes, project names, etc.
   - See "Custom Placeholders" section below for examples
6. Toggle the extension on/off using the floating icon on any webpage
7. Download files as usual - they'll be automatically renamed and categorized!
8. Use the floating panel to preview your current pattern and see resolved values in real-time

### 🧩 Custom Placeholders
- Define on the Options page in the "Custom Placeholders" section:
  - Name: the new placeholder name (e.g., `jira_id`)
  - Base: choose an existing placeholder to derive from (e.g., `{tabUrl}` or `{domain}`)
  - Regex: must contain exactly one capture group `()`; the value will be `match[1]`
  - Keywords: optional comma-separated keywords; if provided, the regex only runs when at least one keyword is present in the base value
- Behavior: if the regex does not match or keywords do not gate, the derived placeholder is considered empty and is skipped in filename joining.

#### Example
- Extract Jira issue key from the tab URL:
  - Name: `jira_id`
  - Base: `{tabUrl}`
  - Regex: `([A-Z]+-\d+)`
  - Keywords: `browse, jira`
  - Pattern: `{jira_id}{originalFilename}{ext}`
  - Result (if on a Jira page like `.../browse/ABC-123`): `ABC-123_report.pdf`

### 📁 Category Examples
- **Pattern:** `{category}_{date}_{originalFilename}`
- **Results:** 
  - `Documents_2024-01-15_quarterly-report.pdf`
  - `Images_2024-01-15_vacation-photo.jpg`
  - `Videos_2024-01-15_tutorial.mp4`

## 🆕 What's New in v1.2

### 🎆 Major New Features
- **Custom Placeholders:** Create your own placeholders using regex patterns!
  - Extract data from URLs, filenames, or any base placeholder
  - Use regex with single capture group to extract specific patterns
  - Optional keyword gating to filter when extraction runs
  - Perfect for Jira IDs, product codes, project names, and more
- **New URL Placeholders:**
  - `{sourceUrl}` - Full download source URL
  - `{tabUrl}` - Referrer/tab URL for context-aware naming
- **Enhanced Preview Panel:**
  - See both raw pattern and resolved preview in real-time
  - Preview shows immediately available values (domain, date, time, tabUrl, etc.)
  - Download-time placeholders display as `{placeholder}` until file is downloaded
- **Smart Filename Construction:**
  - Empty placeholders are automatically skipped (no extra separators)
  - Cleaner, more professional filenames

### 🔄 Upgrade Notes
**Upgrading from v1.1 to v1.2:**
- ✅ **Automatic:** Your existing patterns, categories, and settings are preserved
- ✅ **New Features:** Custom placeholders section now available in Options
- ✅ **Enhanced:** Floating preview now shows resolved values in real-time
- ✅ **Backward Compatible:** All v1.1 and v1.0 functionality remains unchanged

**First Time Using Custom Placeholders?**
1. Go to Options → "Custom Placeholders" section
2. Click "+ Add Custom Placeholder"
3. Define your placeholder (name, base, regex, keywords)
4. Use it in your pattern like any built-in placeholder!

## 🔮 Future Plans

Future versions may include:
- AI-powered filename suggestions
- Natural language rule creation
- Advanced category rules (file size, source domain)
- Duplicate detection
- Conditional renaming rules
- Category-based folder organization

## ⚠️ Known Issues

- The floating icon may occasionally load incorrectly
- The download mechanism works approximately 95% of the time

These issues will be addressed in upcoming updates!

## ℹ️ Notes

- Preview limitations: values like `{originalFilename}`, `{sourceUrl}`, and `{category}` are resolved at download time and may remain as `{placeholder}` in the floating preview.
- Sanitization removes invalid filename characters: `\ / : * ? " < > |`.

## 📝 Feedback

Your feedback is valuable for improving General Download Renamer. Please report any bugs or feature requests through the Chrome Web Store or by contacting the developer directly here:
szhang1@me.com

---

**Stop letting messy downloads slow you down. Install General Download Renamer today and experience the peace of mind that comes with an organized digital life!** 
