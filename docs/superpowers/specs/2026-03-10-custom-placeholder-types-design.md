# Custom Placeholder Types: Literal Text & Counter

## Summary

Extend the existing Custom Placeholders system to support two new placeholder types alongside the existing regex type. This enables users to add static text and auto-incrementing counters to their filename patterns — covering use cases like `Invoice_000001.pdf`.

## Placeholder Types

| Type | Fields | Resolves to |
|---|---|---|
| **Regex** (existing) | Name, Base, Regex, Keywords | Extracted regex match from base placeholder |
| **Text** | Name, Value | The static text exactly as entered |
| **Counter** | Name, Start value | Auto-incrementing number with inferred padding |

## Storage Schema

### Text placeholder
```javascript
{
  name: "invoice",
  type: "text",
  value: "Invoice"
}
```

### Counter placeholder
```javascript
{
  name: "num",
  type: "counter",
  startValue: "000001",  // Original string (preserves padding intent)
  padding: 6,            // Inferred from startValue at creation time
  currentValue: 1        // The actual next number to use (numeric)
}
```

### Regex placeholder (existing, unchanged)
```javascript
{
  name: "productID",
  type: "regex",  // or absent — defaults to "regex" for backward compatibility
  base: "domain",
  regex: "([A-Z]+-\\d+)",
  keywords: "browse,jira"
}
```

## Counter Mechanics

### Padding inference algorithm
If `startValue` has length > 1 and starts with `'0'`, then `padding = startValue.length`. Otherwise `padding = 0` (no padding).

Examples:
- `001` → padding: 3, starts at 1, outputs `001, 002, 003...`
- `01` → padding: 2, outputs `01, 02, ... 99, 100...`
- `000` → padding: 3, outputs `000, 001, 002...`
- `000001` → padding: 6, outputs `000001, 000002...`
- `1` → padding: 0, outputs `1, 2, 3...`
- `0` → padding: 0, outputs `0, 1, 2...` (single `0` is not a leading zero)
- `123456` → padding: 0, outputs `123456, 123457...`

At render time: `String(currentValue).padStart(padding, '0')`

If `currentValue` exceeds padding width (e.g., value `10000` with padding `3`), output the full number — no truncation.

### Default and validation
- Start value field defaults to `001`
- Blank input treated as `001` on save
- Non-negative integer strings only; negative numbers and non-numeric input are rejected (field highlighted as error)

### Increment lifecycle
The service worker caches `customPlaceholders` in memory (existing pattern). Counter increment works as follows:

1. Read counter's `currentValue` from the in-memory `customPlaceholders` array
2. Use that value as the placeholder replacement (padded)
3. Increment `currentValue` in memory
4. Persist updated `customPlaceholders` array to `chrome.storage.local` asynchronously
5. Call `suggest()` with the new filename

This means two rapid downloads will get sequential values from memory even if the storage write hasn't flushed yet. If the service worker terminates between the in-memory increment and the storage write, the last counter value could be lost — this is an acceptable trade-off given the low probability and low impact (a repeated number on next launch).

### Editing start value
Changing a counter's `startValue` in the options page resets `currentValue` to the new parsed start value and recomputes `padding`. This is the same effect as clicking Reset.

### Reset
- Each counter row has a Reset button showing "Current: N"
- Clicking confirms ("Reset counter to start value?") then sets `currentValue` back to the parsed `startValue`
- Counter never auto-resets; user manually resets from options page

## Name Validation

Custom placeholder names (all types) must:
- Be non-empty
- Contain only alphanumeric characters and underscores (`/^[a-zA-Z0-9_]+$/`)
- Not collide with built-in placeholder names: `domain`, `timestamp`, `date`, `time`, `originalFilename`, `category`, `sourceUrl`, `tabUrl`, `ext`
- Be unique among all custom placeholders

The options page validates on input and highlights errors. Invalid names are not saved.

## Separator Behavior

No changes to separator logic. Separator applies between all placeholders uniformly, including text and counter placeholders. This is consistent with existing behavior.

## UI Changes (Options Page)

Each custom placeholder row gets a **Type** dropdown as the first field after Name.

### Field visibility by type

| | Name | Type | Base | Regex | Keywords | Value | Start value | Reset |
|---|---|---|---|---|---|---|---|---|
| **Regex** | Y | Y | Y | Y | Y | | | |
| **Text** | Y | Y | | | | Y | | |
| **Counter** | Y | Y | | | | | Y | Y |

### Placeholder descriptions in Available Blocks
- Regex: `Custom derived from {base}` (existing)
- Text: `Static text: "value"`
- Counter: `Auto-incrementing counter`

### Implementation note
The current `saveCustomPlaceholders` reads inputs by positional index (`inputs[0]` through `inputs[3]`). Since the type dropdown changes which fields are visible, this must be refactored to use class names or data attributes instead of positional indexing.

### Backward compatibility
- Existing custom placeholders without a `type` field default to `"regex"`
- No data migration needed

## Files Changed

| File | Changes |
|---|---|
| `options/options.js` | Type dropdown, conditional field rendering, reset button, save/load logic for new types, refactor positional input reading |
| `options/options.html` | Description text update to mention new types |
| `options/options.css` | Styles for type dropdown, reset button, conditional field visibility |
| `background/service-worker.js` | Type-dispatch in custom placeholder loop, counter increment + async persist to storage |
| `utils/filenameUtils.js` | No changes |

## Example: Invoice Use Case

1. Create custom placeholder: name=`invoice`, type=Text, value=`Invoice`
2. Create custom placeholder: name=`num`, type=Counter, start value=`123456`
3. Drag `{invoice}` and `{num}` into pattern builder, separator=` ` (space)
4. Downloads produce: `Invoice 123456.pdf`, `Invoice 123457.pdf`, `Invoice 123458.pdf`...
