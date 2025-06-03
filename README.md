# TabTune Chrome Extension

TabTune is a powerful Chrome extension that gives you full control over audio and video playback across all your browser tabs. With an intuitive interface, you can independently adjust the volume, mute, pause, or remove any tab with media, and switch between light and dark modes for a comfortable experience.

## Features

- **Independent Volume Control:** Adjust the volume for each tab with audio or video content.
- **Mute/Unmute Tabs:** Instantly mute or unmute any tab.
- **Pause/Play Tabs:** Pause or resume playback in any tab.
- **Remove Tabs from View:** Temporarily hide tabs from the TabTune interface (restore with Refresh).
- **Persistent State:** Removed tabs stay hidden until you choose to refresh.
- **Dark Mode:** Toggle between light and dark themes with a single click.
- **Double-Click to Activate**: Double-click any tab in the popup to instantly switch to it and focus its window.
- **Modern, Responsive UI:** Clean, user-friendly popup with smooth controls and visual feedback.

## Tech Stack

- **JavaScript (ES6+)** — Core logic and Chrome extension APIs
- **HTML5** — Popup and extension structure
- **CSS3** — Modern, responsive, and dark mode styling
- **Chrome Extension Manifest V3** — Secure, performant extension architecture
- **Chrome APIs:**
  - `chrome.tabs`, `chrome.scripting`, `chrome.storage`, `chrome.runtime`

## Installation

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the extension directory.
5. TabTune will appear in your Chrome toolbar.

## Usage

1. Click the TabTune icon in your Chrome toolbar to open the popup.
2. Adjust the volume slider for any tab with audio/video.
3. Use the **Mute**, **Pause**, or **Remove** controls as needed. 
4. Double-click any tab in the popup to instantly switch to it and focus its window.
5. Click **Refresh** at the bottom to restore removed tabs.
6. Toggle dark mode with the sun/moon icon in the header.

## Development

TabTune is organized for easy development and customization:

- `manifest.json` — Extension configuration and permissions
- `popup.html` / `popup.js` — User interface and logic
- `content.js` — Injected into tabs to control media elements
- `background.js` — Handles tab state, messaging, and storage
- `styles.css` — All popup and dark mode styling
- `icons/` — Extension icons 

## Notes

- TabTune works on any website with audio or video elements, except for Chrome system pages (e.g., chrome:// URLs).
-Adjusting overall device volume can increase the maximum threshold.
-For maximum seamlessnes make sure to pause a tab throught the extention instead of on the tab itself.

## Demo

<!-- Add screenshots or a GIF here to showcase the extension in action -->

