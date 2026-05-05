# Intcu Chrome Extension

AI teleprompter overlay with live conversation copilot. Works on Zoom, Meet, Teams, and any webpage.

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the `chrome-extension` folder from this project
5. Pin the Intcu extension to your toolbar for quick access

## Features

- **Floating Button**: Teal "ic" button on every page — click to open teleprompter overlay
- **Side Panel**: Full Intcu app alongside any webpage
- **Context Menu**: Right-click selected text → "Send to Intcu Script" or "Brainstorm this with Intcu"
- **Quick Popup**: Fast script reader with auto-scroll
- **Meeting Detection**: Auto-pulses on Zoom, Meet, and Teams pages

## Icons

The extension ships with placeholder icons. To generate proper icons:
1. Open `create-icons.html` in a browser
2. Right-click each canvas and save to the `icons/` folder

Or run `node generate-icons.js` if you have the `canvas` npm package installed.

## Architecture

```
chrome-extension/
├── manifest.json      # Manifest V3 config
├── background.js      # Service worker — context menus, messaging
├── popup.html/js      # Extension popup (300x400)
├── sidepanel.html/js  # Side panel — iframe to intcu.com
├── content.js/css     # Floating button + overlay on all pages
├── icons/             # Extension icons (16, 48, 128px)
└── README.md          # This file
```
