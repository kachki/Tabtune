# TabTune Chrome Extension

A Chrome extension that allows you to control and sync audio volume across all browser tabs with audio or video elements.

## Features

- Control volume of audio/video elements in the current tab
- Sync volume across all open tabs
- Simple and intuitive interface
- Works with any website that has audio or video content

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The TabTune extension should now be installed and visible in your Chrome toolbar

## Usage

1. Click the TabTune icon in your Chrome toolbar to open the popup
2. Use the volume slider to adjust the volume of audio/video elements in the current tab
3. Click "Sync All Tabs" to apply the current volume level to all open tabs with audio/video content

## Development

The extension is built using Chrome Extension Manifest V3 and includes:

- `manifest.json`: Extension configuration
- `popup.html/js`: User interface
- `content.js`: Handles volume control on individual pages
- `background.js`: Manages communication between tabs
- `styles.css`: Popup styling

## Note

You'll need to add an icon file at `icons/icon128.png` before loading the extension. You can use any 128x128 PNG image as a placeholder. 