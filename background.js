// Store volume states for each tab
const tabVolumes = new Map();
const mutedTabs = new Set();
const pausedTabs = new Set();

// Function to check if a tab has media elements
async function checkTabForMedia(tab) {
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    return false;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        return document.querySelectorAll('audio, video').length > 0;
      }
    });
    return results[0].result;
  } catch (error) {
    console.log(`[TabTune] Could not check tab ${tab.id} for media:`, error.message);
    return false;
  }
}

// Function to set volume for a specific tab
async function setTabVolume(tabId, volume) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      function: (volume) => {
        const mediaElements = document.querySelectorAll('audio, video');
        mediaElements.forEach(media => {
          try {
            media.volume = volume;
            media.muted = false;
          } catch (error) {
            console.error(`[TabTune] Error setting volume:`, error);
          }
        });
      },
      args: [volume]
    });
    tabVolumes.set(tabId, volume);
    return true;
  } catch (error) {
    console.error(`[TabTune] Error setting volume for tab ${tabId}:`, error);
    return false;
  }
}

// Function to toggle mute for a specific tab
async function toggleMute(tabId) {
  try {
    const isMuted = mutedTabs.has(tabId);
    await chrome.scripting.executeScript({
      target: { tabId },
      function: (shouldMute) => {
        const mediaElements = document.querySelectorAll('audio, video');
        mediaElements.forEach(media => {
          try {
            media.muted = shouldMute;
          } catch (error) {
            console.error(`[TabTune] Error toggling mute:`, error);
          }
        });
      },
      args: [!isMuted]
    });
    
    if (isMuted) {
      mutedTabs.delete(tabId);
    } else {
      mutedTabs.add(tabId);
    }
    return { success: true, isMuted: !isMuted };
  } catch (error) {
    console.error(`[TabTune] Error toggling mute for tab ${tabId}:`, error);
    return { success: false };
  }
}

// Function to toggle pause for a specific tab
async function togglePause(tabId) {
  try {
    const isPaused = pausedTabs.has(tabId);
    await chrome.scripting.executeScript({
      target: { tabId },
      function: (shouldPause) => {
        const mediaElements = document.querySelectorAll('audio, video');
        mediaElements.forEach(media => {
          try {
            if (shouldPause) {
              media.pause();
            } else {
              media.play();
            }
          } catch (error) {
            console.error(`[TabTune] Error toggling pause:`, error);
          }
        });
      },
      args: [!isPaused]
    });
    
    if (isPaused) {
      pausedTabs.delete(tabId);
    } else {
      pausedTabs.add(tabId);
    }
    return { success: true, isPaused: !isPaused };
  } catch (error) {
    console.error(`[TabTune] Error toggling pause for tab ${tabId}:`, error);
    return { success: false };
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[TabTune] Background received message:', message);

  if (message.action === 'getTabsWithMedia') {
    (async () => {
      try {
        const tabs = await chrome.tabs.query({});
        const tabsWithMedia = [];

        for (const tab of tabs) {
          const hasMedia = await checkTabForMedia(tab);
          if (hasMedia) {
            tabsWithMedia.push({
              id: tab.id,
              title: tab.title,
              volume: tabVolumes.get(tab.id) || 1.0,
              isMuted: mutedTabs.has(tab.id),
              isPaused: pausedTabs.has(tab.id)
            });
          }
        }

        sendResponse({ tabs: tabsWithMedia });
      } catch (error) {
        console.error('[TabTune] Error getting tabs with media:', error);
        sendResponse({ error: error.message });
      }
    })();
    return true;
  }

  if (message.action === 'setTabVolume') {
    const { tabId, volume } = message;
    setTabVolume(tabId, volume).then(success => {
      sendResponse({ success });
    });
    return true;
  }

  if (message.action === 'toggleMute') {
    const { tabId } = message;
    toggleMute(tabId).then(response => {
      sendResponse(response);
    });
    return true;
  }

  if (message.action === 'togglePause') {
    const { tabId } = message;
    togglePause(tabId).then(response => {
      sendResponse(response);
    });
    return true;
  }

  if (message.action === 'removeTab') {
    const { tabId } = message;
    tabVolumes.delete(tabId);
    mutedTabs.delete(tabId);
    pausedTabs.delete(tabId);
    sendResponse({ success: true });
    return true;
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabVolumes.delete(tabId);
  mutedTabs.delete(tabId);
  pausedTabs.delete(tabId);
});

// Initialize volume for new tabs with media
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const hasMedia = await checkTabForMedia(tab);
    if (hasMedia && !tabVolumes.has(tabId)) {
      tabVolumes.set(tabId, 1.0);
    }
  }
});

// Log when background script is loaded
console.log('TabTune background script loaded'); 