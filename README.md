# Element Shuffler Chrome Extension

## Overview


Element Shuffler was created out of a need to efficiently shuffle Jira quick filters, but its versatility extends to rearranging most webpage elements unless it uses a different DOM. 

## How It Works

1. **Select Element Mode:**
   - Activate via the extension icon and click any element to rearrange.

2. **Buttons:**
   - **Shuffle:** Shuffle element’s children.
   - **Up/Down:** Select parent/first child element.
   - **Left/Right:** Select previous/next sibling.
   - **Remove:** Remove the shuffle button.

3. **Clear All Elements:**
   - Remove all shuffle buttons with the "Clear All Elements" button in the popup.

## Installation

### Chrome

1. Clone/download the repository.
2. Copy `manifest-chrome.json` to `manifest.json`.
3. Navigate to `chrome://extensions/`.
4. Enable "Developer mode" and select "Load unpacked".
5. Choose the extension directory.

### Firefox

1. Clone/download the repository.
2. Copy `manifest-firefox.json` to `manifest.json`.
3. Go to `about:debugging` in Firefox.
4. Click "This Firefox" (or "This Nightly").
5. Select "Load Temporary Add-on" and choose `manifest.json`.

## Usage

1. Click the Element Shuffler icon in the toolbar.
2. Select "Select Element" mode from the popup.
3. Click any webpage element to add the shuffle button.
4. Use the buttons to navigate and manipulate elements.

## Development

### Files

- **content.js:** Main logic for selection, button creation, and manipulation.
- **popup.html:** HTML for the popup interface.
- **popup.js:** Handles popup interactions.
- **manifest-chrome.json:** Configuration for Chrome.
- **manifest-firefox.json:** Configuration for Firefox.

### Adding Delays

Use `setTimeout` to ensure content loads before execution:

```javascript
window.addEventListener("load", () => {
    setTimeout(() => {
        loadShuffleButtons();
    }, 1000);
});
```

## Privacy Policy

Element Shuffler does not collect user data. All operations are local to the user's machine.

## Support

For questions or support, contact [jpandadev@gmail.com].

## License

Licensed under the MIT License. See the LICENSE file for details.
