# Custom Placeholder Types Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Text" (literal) and "Counter" (auto-incrementing) types to the existing Custom Placeholders system so users can create patterns like `Invoice_000001.pdf`.

**Architecture:** The Custom Placeholders UI gains a Type dropdown that shows/hides fields conditionally. The background service worker's custom placeholder resolution loop dispatches on type. Counter state (currentValue) is cached in memory and persisted to storage asynchronously. No changes to `utils/filenameUtils.js`.

**Tech Stack:** Chrome Extension Manifest V3, ES6+ JavaScript, Chrome Storage API

**Spec:** `docs/superpowers/specs/2026-03-10-custom-placeholder-types-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `options/options.html` | Modify | Update description text for Custom Placeholders section |
| `options/options.css` | Modify | Add styles for type dropdown, reset button, conditional field visibility, validation errors |
| `options/options.js` | Modify | Type dropdown, conditional field rendering, name validation, save/load refactor, reset button |
| `background/service-worker.js` | Modify | Type-dispatch in placeholder loop, counter increment + async persist |

---

## Chunk 1: Options Page UI

### Task 1: Update HTML description and add CSS for new elements

**Files:**
- Modify: `options/options.html:76-87`
- Modify: `options/options.css:310-347`

- [ ] **Step 1: Update the Custom Placeholders description text in options.html**

Replace lines 78-82 in `options/options.html` (the entire `<p class="description">...</p>` block):

```html
<p class="description">
  Define custom placeholders for your filename patterns. Choose a type:
  <strong>Regex</strong> to extract data from URLs using patterns,
  <strong>Text</strong> for static text like "Invoice" or "Report",
  or <strong>Counter</strong> for auto-incrementing numbers.
</p>
```

- [ ] **Step 2: Add CSS for type dropdown, conditional fields, reset button, and validation**

Append to `options/options.css`:

```css
/* Custom Placeholder Type Dropdown */
.custom-placeholder-rule select.cp-type-select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background-color: #f9f9f9;
  font-weight: 500;
}

/* Grid layouts per type */
.custom-placeholder-rule[data-type="regex"] {
  grid-template-columns: 1fr 0.7fr 1fr 1.5fr 1.5fr auto;
}

.custom-placeholder-rule[data-type="text"] {
  grid-template-columns: 1fr 0.7fr 2fr auto;
}

.custom-placeholder-rule[data-type="counter"] {
  grid-template-columns: 1fr 0.7fr 1fr auto auto;
}

/* Hide fields not relevant to current type */
.custom-placeholder-rule .cp-field-hidden {
  display: none;
}

/* Reset Counter Button */
.reset-counter-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.reset-counter-btn:hover {
  background-color: #5a6268;
}

/* Name validation error */
.custom-placeholder-rule input.cp-name-input.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

/* Start value validation error */
.custom-placeholder-rule input.cp-start-value.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}
```

- [ ] **Step 3: Verify HTML and CSS changes load correctly**

Load the extension in Chrome Developer Mode. Open the Options page. Confirm:
- The new description text appears in the Custom Placeholders section
- No layout breakage elsewhere on the page

- [ ] **Step 4: Commit**

```bash
git add options/options.html options/options.css
git commit -m "feat: update custom placeholders UI text and add CSS for new types"
```

---

### Task 2: Refactor options.js — createCustomPlaceholderElement with type support

**Files:**
- Modify: `options/options.js:145-253`

This task replaces the existing `createCustomPlaceholderElement` function and its helpers with a version that supports all three types and uses class-based field selection instead of positional indexing.

- [ ] **Step 1: Add constants for built-in names and name validation**

Add after `currentCustomPlaceholders` (after line 44 in `options/options.js`):

```javascript
// Reserved names that cannot be used for custom placeholders
const RESERVED_NAMES = ['domain', 'timestamp', 'date', 'time', 'originalFilename', 'category', 'sourceUrl', 'tabUrl', 'ext'];
const NAME_REGEX = /^[a-zA-Z0-9_]+$/;
```

- [ ] **Step 2: Replace createCustomPlaceholderElement with type-aware version**

Replace the existing `createCustomPlaceholderElement` function (lines 145-206) with:

```javascript
/**
 * Creates a custom placeholder rule element in the UI with type support.
 * @param {Object} rule - The rule object
 * @param {number} index - The index for tracking
 * @returns {HTMLElement} The created row element
 */
function createCustomPlaceholderElement(rule, index) {
  const type = rule.type || 'regex';
  const div = document.createElement('div');
  div.className = 'custom-placeholder-rule';
  div.dataset.index = index;
  div.dataset.type = type;

  // Name input (all types)
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'cp-name-input';
  nameInput.placeholder = 'Name (e.g., invoice)';
  nameInput.value = rule.name || '';

  // Type dropdown (all types)
  const typeSelect = document.createElement('select');
  typeSelect.className = 'cp-type-select';
  ['regex', 'text', 'counter'].forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    typeSelect.appendChild(opt);
  });
  typeSelect.value = type;

  // Regex fields
  const baseSelect = document.createElement('select');
  baseSelect.className = 'cp-base-select';
  BUILTIN_PLACEHOLDERS.forEach(ph => {
    const opt = document.createElement('option');
    opt.value = ph;
    opt.textContent = `{${ph}}`;
    baseSelect.appendChild(opt);
  });
  baseSelect.value = rule.base || BUILTIN_PLACEHOLDERS[0];

  const regexInput = document.createElement('input');
  regexInput.type = 'text';
  regexInput.className = 'cp-regex-input';
  regexInput.placeholder = 'Regex with one capture group';
  regexInput.value = rule.regex || '';

  const keywordsInput = document.createElement('input');
  keywordsInput.type = 'text';
  keywordsInput.className = 'cp-keywords-input';
  keywordsInput.placeholder = 'Keywords (comma-separated, optional)';
  keywordsInput.value = rule.keywords || '';

  // Text fields
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.className = 'cp-value-input';
  valueInput.placeholder = 'Static text value (e.g., Invoice)';
  valueInput.value = rule.value || '';

  // Counter fields
  const startValueInput = document.createElement('input');
  startValueInput.type = 'text';
  startValueInput.className = 'cp-start-value';
  startValueInput.placeholder = 'Start value (e.g., 001)';
  startValueInput.value = rule.startValue || '001';

  const resetBtn = document.createElement('button');
  resetBtn.className = 'reset-counter-btn';
  const currentVal = rule.currentValue !== undefined ? rule.currentValue : parseInt(rule.startValue || '1', 10);
  resetBtn.textContent = `Reset (cur: ${currentVal})`;
  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset counter to start value?')) return;
    const sv = startValueInput.value.trim() || '001';
    const parsed = parseInt(sv, 10);
    if (isNaN(parsed) || parsed < 0) return;
    // Update the button text immediately
    resetBtn.textContent = `Reset (cur: ${parsed})`;
    // Save with reset for this specific counter
    const counterName = nameInput.value.trim();
    saveCustomPlaceholders(counterName);
  });

  // Delete button (all types)
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-custom-placeholder-btn';
  deleteBtn.textContent = 'Delete';

  // --- Assemble the row ---
  div.appendChild(nameInput);
  div.appendChild(typeSelect);
  div.appendChild(baseSelect);
  div.appendChild(regexInput);
  div.appendChild(keywordsInput);
  div.appendChild(valueInput);
  div.appendChild(startValueInput);
  div.appendChild(resetBtn);
  div.appendChild(deleteBtn);

  // Apply field visibility for the current type
  applyTypeVisibility(div, type);

  // --- Event listeners ---
  function onFieldChange() {
    validateCustomPlaceholderName(nameInput);
    const currentType = typeSelect.value;
    if (currentType === 'counter') {
      validateStartValue(startValueInput);
    }
    saveCustomPlaceholders();
    loadCustomPlaceholdersAndUpdateLists(() => {
      populateAvailableBlocks();
      populateDescriptions();
    });
  }

  typeSelect.addEventListener('change', () => {
    const newType = typeSelect.value;
    div.dataset.type = newType;
    applyTypeVisibility(div, newType);
    onFieldChange();
  });

  nameInput.addEventListener('input', onFieldChange);
  baseSelect.addEventListener('change', onFieldChange);
  regexInput.addEventListener('input', onFieldChange);
  keywordsInput.addEventListener('input', onFieldChange);
  valueInput.addEventListener('input', onFieldChange);
  startValueInput.addEventListener('input', () => {
    validateStartValue(startValueInput);
    // Per spec: changing startValue resets currentValue
    const counterName = nameInput.value.trim();
    saveCustomPlaceholders(counterName);
  });

  deleteBtn.addEventListener('click', () => {
    div.remove();
    saveCustomPlaceholders();
    loadCustomPlaceholdersAndUpdateLists(() => {
      populateAvailableBlocks();
      populateDescriptions();
    });
  });

  return div;
}
```

- [ ] **Step 3: Add the applyTypeVisibility helper function**

Add after `createCustomPlaceholderElement`:

```javascript
/**
 * Shows/hides fields in a custom placeholder row based on the selected type.
 * @param {HTMLElement} row - The .custom-placeholder-rule element
 * @param {string} type - 'regex', 'text', or 'counter'
 */
function applyTypeVisibility(row, type) {
  const fields = {
    regex: ['cp-base-select', 'cp-regex-input', 'cp-keywords-input'],
    text: ['cp-value-input'],
    counter: ['cp-start-value', 'reset-counter-btn']
  };

  // All optional field classes
  const allOptional = [
    'cp-base-select', 'cp-regex-input', 'cp-keywords-input',
    'cp-value-input', 'cp-start-value', 'reset-counter-btn'
  ];

  const visible = fields[type] || fields.regex;

  allOptional.forEach(cls => {
    const el = row.querySelector(`.${cls}`);
    if (el) {
      if (visible.includes(cls)) {
        el.classList.remove('cp-field-hidden');
      } else {
        el.classList.add('cp-field-hidden');
      }
    }
  });
}
```

- [ ] **Step 4: Add validation helper functions**

Add after `applyTypeVisibility`:

```javascript
/**
 * Validates a custom placeholder name input.
 * Checks: non-empty, valid characters, not reserved, unique.
 * @param {HTMLInputElement} input - The name input element
 * @returns {boolean} Whether the name is valid
 */
function validateCustomPlaceholderName(input) {
  const name = input.value.trim();
  input.classList.remove('error');

  if (!name) return true; // Allow empty while typing

  if (!NAME_REGEX.test(name)) {
    input.classList.add('error');
    return false;
  }

  if (RESERVED_NAMES.includes(name)) {
    input.classList.add('error');
    return false;
  }

  // Check uniqueness among other custom placeholders
  const allNameInputs = document.querySelectorAll('.custom-placeholder-rule .cp-name-input');
  const duplicateCount = Array.from(allNameInputs).filter(
    el => el !== input && el.value.trim() === name
  ).length;

  if (duplicateCount > 0) {
    input.classList.add('error');
    return false;
  }

  return true;
}

/**
 * Validates a counter start value input.
 * @param {HTMLInputElement} input - The start value input element
 * @returns {boolean} Whether the start value is valid
 */
function validateStartValue(input) {
  const val = input.value.trim();
  input.classList.remove('error');

  if (!val) return true; // Blank defaults to 001 on save

  if (!/^\d+$/.test(val)) {
    input.classList.add('error');
    return false;
  }

  return true;
}
```

- [ ] **Step 5: Verify the new function renders correctly**

Load extension, open Options page. Add a new custom placeholder. Confirm:
- Type dropdown appears with Regex/Text/Counter options
- Switching types shows/hides the correct fields
- Existing regex placeholders still display correctly (backward compatibility)

- [ ] **Step 6: Commit**

```bash
git add options/options.js
git commit -m "feat: add type-aware custom placeholder UI with conditional fields and validation"
```

---

### Task 3: Refactor saveCustomPlaceholders and loadCustomPlaceholderRules

**Files:**
- Modify: `options/options.js:211-253`

This task replaces the save/load functions to use class-based field reading and support all three types.

- [ ] **Step 1: Replace saveCustomPlaceholders**

Replace the existing `saveCustomPlaceholders` function (lines 225-241) with:

```javascript
/**
 * Saves current custom placeholders to storage.
 * Reads fields by class name (not positional index) to support all types.
 * @param {string|null} resetCounterName - If provided, reset currentValue for this specific counter
 */
function saveCustomPlaceholders(resetCounterName = null) {
  const rules = [];
  const ruleElements = customPlaceholdersContainer.querySelectorAll('.custom-placeholder-rule');

  ruleElements.forEach(el => {
    const name = el.querySelector('.cp-name-input').value.trim();
    const type = el.querySelector('.cp-type-select').value;

    if (!name) return; // Skip unnamed placeholders
    if (!NAME_REGEX.test(name) || RESERVED_NAMES.includes(name)) return; // Skip invalid names

    if (type === 'text') {
      const value = el.querySelector('.cp-value-input').value;
      if (!value) return;
      rules.push({ name, type, value });
    } else if (type === 'counter') {
      let startValueStr = el.querySelector('.cp-start-value').value.trim();
      if (!startValueStr) startValueStr = '001'; // Default
      if (!/^\d+$/.test(startValueStr)) return; // Skip invalid

      const padding = (startValueStr.length > 1 && startValueStr.startsWith('0'))
        ? startValueStr.length : 0;
      const parsedStart = parseInt(startValueStr, 10);

      // Reset currentValue if this counter was explicitly reset or its startValue changed
      let currentValue = parsedStart;
      if (resetCounterName !== name) {
        // Preserve existing currentValue if not being reset
        const existing = currentCustomPlaceholders.find(
          cp => cp.name === name && cp.type === 'counter'
        );
        if (existing && existing.currentValue !== undefined
            && existing.startValue === startValueStr) {
          // Same startValue, preserve counter progress
          currentValue = existing.currentValue;
        }
        // If startValue changed (existing.startValue !== startValueStr),
        // currentValue stays at parsedStart (reset per spec)
      }

      rules.push({ name, type, startValue: startValueStr, padding, currentValue });
    } else {
      // Regex type (default)
      const base = el.querySelector('.cp-base-select').value;
      const regex = el.querySelector('.cp-regex-input').value.trim();
      const keywords = el.querySelector('.cp-keywords-input').value.trim();
      if (!base || !regex) return;
      rules.push({ name, type: 'regex', base, regex, keywords });
    }
  });

  chrome.storage.local.set({ customPlaceholders: rules }, () => {
    currentCustomPlaceholders = rules;
  });
}
```

- [ ] **Step 2: Replace loadCustomPlaceholderRules**

Replace the existing `loadCustomPlaceholderRules` function (lines 211-220) with:

```javascript
/**
 * Loads and renders custom placeholders in the options UI.
 * Handles all three types: regex, text, counter.
 */
function loadCustomPlaceholderRules() {
  chrome.storage.local.get(['customPlaceholders'], (result) => {
    const rules = Array.isArray(result.customPlaceholders) ? result.customPlaceholders : [];
    customPlaceholdersContainer.innerHTML = '';
    rules.forEach((rule, idx) => {
      const el = createCustomPlaceholderElement(rule, idx);
      customPlaceholdersContainer.appendChild(el);
    });
  });
}
```

- [ ] **Step 3: Replace addNewCustomPlaceholder to default to 'regex' type**

Replace the existing `addNewCustomPlaceholder` function (lines 246-253) with:

```javascript
/**
 * Adds a new custom placeholder row, defaulting to regex type.
 */
function addNewCustomPlaceholder() {
  const rule = { name: '', type: 'regex', base: BUILTIN_PLACEHOLDERS[0], regex: '', keywords: '' };
  const idx = customPlaceholdersContainer.children.length;
  const el = createCustomPlaceholderElement(rule, idx);
  customPlaceholdersContainer.appendChild(el);
  const nameInput = el.querySelector('.cp-name-input');
  if (nameInput) nameInput.focus();
}
```

- [ ] **Step 4: Update loadCustomPlaceholdersAndUpdateLists for new type descriptions**

Replace the description generation inside `loadCustomPlaceholdersAndUpdateLists` (lines 128-139). The `forEach` body that builds `PLACEHOLDERS_INFO` should become:

```javascript
currentCustomPlaceholders.forEach(cp => {
  if (cp && cp.name) {
    const type = cp.type || 'regex';
    if (type === 'text') {
      PLACEHOLDERS_INFO[cp.name] = `Static text: "${cp.value || ''}"`;
    } else if (type === 'counter') {
      PLACEHOLDERS_INFO[cp.name] = 'Auto-incrementing counter';
    } else {
      PLACEHOLDERS_INFO[cp.name] = `Custom derived from {${cp.base || 'unknown'}}`;
    }
  }
});
```

- [ ] **Step 5: Verify save/load round-trip**

Load extension, open Options page:
1. Create a Text placeholder: name=`invoice`, type=Text, value=`Invoice`. Verify it saves and reloads.
2. Create a Counter placeholder: name=`num`, type=Counter, start value=`001`. Verify it saves and reloads.
3. Create a Regex placeholder: name=`test`, type=Regex with base/regex. Verify it saves and reloads.
4. Verify existing regex-only placeholders load correctly (backward compat).
5. Verify the Available Blocks list shows the new custom placeholders as draggable chips.
6. Verify the placeholder descriptions show the correct text for each type.

- [ ] **Step 6: Commit**

```bash
git add options/options.js
git commit -m "feat: refactor custom placeholder save/load for text and counter types"
```

---

## Chunk 2: Background Service Worker

### Task 4: Add type-dispatch and counter increment to service worker

**Files:**
- Modify: `background/service-worker.js:146-187`

- [ ] **Step 1: Replace the custom placeholder resolution loop in processDownload**

Replace lines 146-187 in `background/service-worker.js` (the `if (Array.isArray(customPlaceholders)...` block) with:

```javascript
// Apply custom placeholders based on their type
if (Array.isArray(customPlaceholders) && customPlaceholders.length > 0) {
  let counterUpdated = false;

  for (const def of customPlaceholders) {
    const name = (def && def.name) ? String(def.name) : '';
    const type = (def && def.type) ? String(def.type) : 'regex';

    if (!name) continue;

    if (type === 'text') {
      // Text type: use the static value directly
      placeholders[name] = def.value ? String(def.value) : '';

    } else if (type === 'counter') {
      // Counter type: use currentValue with padding, then increment
      const currentValue = def.currentValue !== undefined ? def.currentValue : 0;
      const padding = def.padding || 0;
      placeholders[name] = String(currentValue).padStart(padding, '0');

      // Increment in memory
      def.currentValue = currentValue + 1;
      counterUpdated = true;

    } else {
      // Regex type (existing behavior)
      const from = def.base ? String(def.base) : '';
      const regexStr = def.regex ? String(def.regex) : '';
      const keywordsRaw = def.keywords !== undefined ? String(def.keywords) : '';

      if (!from || !regexStr) {
        placeholders[name] = '';
        continue;
      }

      const sourceValue = placeholders[from] || '';
      if (!sourceValue) {
        placeholders[name] = '';
        continue;
      }

      // Keyword gating
      const keywords = keywordsRaw
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const gatePass = keywords.length === 0
        ? true
        : keywords.some(k => sourceValue.toLowerCase().includes(k.toLowerCase()));

      if (!gatePass) {
        placeholders[name] = '';
        continue;
      }

      try {
        const re = new RegExp(regexStr);
        const m = sourceValue.match(re);
        placeholders[name] = (m && m[1]) ? String(m[1]) : '';
      } catch (e) {
        console.error('Invalid custom placeholder regex:', name, regexStr, e);
        placeholders[name] = '';
      }
    }
  }

  // Persist counter updates to storage asynchronously
  if (counterUpdated) {
    chrome.storage.local.set({ customPlaceholders: customPlaceholders }, () => {
      console.log('Counter values persisted to storage');
    });
  }
}
```

- [ ] **Step 2: Verify counter increments in the service worker console**

Load extension in Chrome. Set up a pattern with a counter placeholder. Download a file.
1. Open `chrome://extensions/` → find extension → click "Inspect views: service worker"
2. Check console for `Renaming:` log showing the counter value
3. Download another file, confirm counter incremented
4. Check `chrome.storage.local` in DevTools to confirm `currentValue` persisted

- [ ] **Step 3: Verify text placeholder resolves correctly**

With a text placeholder named `invoice` with value `Invoice` in the pattern:
1. Download a file
2. Confirm the filename includes the literal text "Invoice"

- [ ] **Step 4: Verify backward compatibility with regex placeholders**

With an existing regex placeholder in the pattern:
1. Download a file from a matching URL
2. Confirm regex extraction still works as before

- [ ] **Step 5: Commit**

```bash
git add background/service-worker.js
git commit -m "feat: add text and counter type resolution in download processing"
```

---

### Task 5: Handle counter state sync from options page changes

**Files:**
- Modify: `background/service-worker.js:88-96`

When the user edits counter settings in the options page, the storage change listener in the service worker needs to pick up the new `currentValue`.

- [ ] **Step 1: Verify the existing storage change listener handles customPlaceholders**

The existing listener at lines 93-96 already updates the in-memory `customPlaceholders` from storage changes:

```javascript
if (changes.customPlaceholders !== undefined) {
  customPlaceholders = Array.isArray(changes.customPlaceholders.newValue) ? changes.customPlaceholders.newValue : [];
  console.log('Custom placeholders updated:', customPlaceholders.length);
}
```

This already handles the case where the options page saves new counter definitions or resets. The in-memory cache gets the latest `currentValue` from storage. **No code change needed here.**

- [ ] **Step 2: Test the reset flow end-to-end**

1. Create a counter placeholder, download 3 files (counter goes to start+3)
2. Open Options page, click Reset on the counter
3. Download another file — counter should be back at start value
4. Verify in service worker console that the counter value matches

- [ ] **Step 3: Test editing start value**

1. Create a counter with start value `001`
2. Download 2 files (counter at 3)
3. Change start value to `0001` in Options
4. Download a file — counter should now show `0001` (reset due to startValue change)

- [ ] **Step 4: Commit (if any changes were needed)**

If no code changes were needed (just verification), skip this commit.

---

### Task 6: Final integration test and version bump

- [ ] **Step 1: Full end-to-end test — Invoice use case**

1. Open Options → Custom Placeholders
2. Add: name=`invoice`, type=Text, value=`Invoice`
3. Add: name=`num`, type=Counter, start value=`123456`
4. Drag `{invoice}` and `{num}` into pattern, separator=`_`
5. Save settings
6. Download 3 files
7. Confirm filenames: `Invoice_123456.pdf`, `Invoice_123457.pdf`, `Invoice_123458.pdf`

- [ ] **Step 2: Test edge cases**

1. Counter with start value `001` — verify padding: `001`, `002`, ... `999`, `1000`
2. Counter with start value `0` — verify: `0`, `1`, `2`...
3. Blank start value — verify defaults to `001`
4. Name collision with built-in (type `date`) — verify error styling, not saved
5. Duplicate custom names — verify error styling
6. Existing regex-only placeholders — verify they load and work unchanged

- [ ] **Step 3: Commit all remaining changes**

```bash
git add -A
git commit -m "feat: custom placeholder types — text and counter support

Add Text and Counter types to the custom placeholders system.
Text type resolves to a static string. Counter type auto-increments
with padding inferred from the start value format.

Closes the 'Invoice 123456' user request."
```
