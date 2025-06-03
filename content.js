// Function to check for media elements and log their state
function checkMediaElements() {
  const mediaElements = document.querySelectorAll('audio, video');
  console.log(`[TabTune] Found ${mediaElements.length} media elements on page:`, window.location.href);
  
  mediaElements.forEach((media, index) => {
    console.log(`[TabTune] Media element ${index + 1}:`, {
      type: media.tagName.toLowerCase(),
      currentVolume: media.volume,
      muted: media.muted,
      src: media.src || media.currentSrc
    });
  });
  
  return mediaElements.length > 0;
}

// Function to set volume for all media elements on the page
function setVolume(value) {
  const mediaElements = document.querySelectorAll('audio, video');
  console.log(`[TabTune] Setting volume to ${value} for ${mediaElements.length} media elements on:`, window.location.href);
  
  mediaElements.forEach((media, index) => {
    try {
      const oldVolume = media.volume;
      media.volume = value;
      media.muted = false;
      console.log(`[TabTune] Updated volume for ${media.tagName.toLowerCase()} ${index + 1}:`, {
        oldVolume,
        newVolume: media.volume,
        success: true
      });
    } catch (error) {
      console.error(`[TabTune] Error setting volume for ${media.tagName.toLowerCase()} ${index + 1}:`, error);
    }
  });
}

// Function to toggle mute for all media elements
function toggleMute() {
  const mediaElements = document.querySelectorAll('audio, video');
  const isMuted = mediaElements[0]?.muted ?? false;
  console.log(`[TabTune] Toggling mute state from ${isMuted} to ${!isMuted} on:`, window.location.href);
  
  mediaElements.forEach((media, index) => {
    try {
      media.muted = !isMuted;
      console.log(`[TabTune] Toggled mute for ${media.tagName.toLowerCase()} ${index + 1}:`, {
        newMuteState: media.muted,
        success: true
      });
    } catch (error) {
      console.error(`[TabTune] Error toggling mute for ${media.tagName.toLowerCase()} ${index + 1}:`, error);
    }
  });
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[TabTune] Received message:', message, 'on page:', window.location.href);
  
  if (message.action === 'setVolume') {
    try {
      setVolume(message.value);
      sendResponse({ success: true });
    } catch (error) {
      console.error('[TabTune] Error in setVolume:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.action === 'toggleMute') {
    try {
      toggleMute();
      sendResponse({ success: true });
    } catch (error) {
      console.error('[TabTune] Error in toggleMute:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.action === 'checkMedia') {
    const hasMedia = checkMediaElements();
    sendResponse({ hasMedia });
  }
  return true; // Keep the message channel open for async response
});

// Log when content script is loaded
console.log('[TabTune] Content script loaded on:', window.location.href);
// Initial check for media elements
checkMediaElements(); 