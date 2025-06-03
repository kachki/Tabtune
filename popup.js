document.addEventListener('DOMContentLoaded', () => {
  const tabsContainer = document.getElementById('tabsContainer');
  const noTabsMessage = document.getElementById('noTabsMessage');
  const refreshButton = document.getElementById('refreshButton');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const darkModeIcon = document.getElementById('darkModeIcon');

  // Dark mode logic
  function setDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    if (darkModeIcon) {
      darkModeIcon.src = isDark ? 'icons/sun.png' : 'icons/moon.png';
      darkModeIcon.alt = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  // Load dark mode preference
  chrome.storage.local.get(['tabtuneDarkMode'], (result) => {
    setDarkMode(!!result.tabtuneDarkMode);
  });

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark-mode');
      setDarkMode(isDark);
      chrome.storage.local.set({ tabtuneDarkMode: isDark });
    });
  }

  // Helper to set slider fill color
  function setSliderFill(slider) {
    const value = parseFloat(slider.value);
    slider.style.setProperty('--value', `${value * 100}%`);
  }

  // Store removed tabs in chrome.storage for persistence
  chrome.storage.local.get(['removedTabs'], (result) => {
    const removedTabs = new Set(result.removedTabs || []);
    updateTabsList(removedTabs);
  });

  // Create volume control for a tab
  function createTabControl(tab, removedTabs) {
    const tabControl = document.createElement('div');
    tabControl.className = 'tab-control';
    const favicon = tab.favIconUrl ? `<img src="${tab.favIconUrl}" class="tab-favicon" alt="icon" onerror="this.style.display='none'">` : '<span class="tab-favicon fallback">🌐</span>';
    tabControl.innerHTML = `
      <div class="tab-header">
        <div class="tab-title" title="${tab.title}">${favicon} ${tab.title}</div>
        <div class="tab-actions">
          <button class="tab-button mute-button" title="Mute">${tab.isMuted ? 'Unmute' : 'Mute'}</button>
          <button class="tab-button pause-button" title="Pause">${tab.isPaused ? 'Play' : 'Pause'}</button>
          <button class="tab-button remove-button" title="Remove from TabTune">Remove</button>
        </div>
      </div>
      <div class="volume-control">
        <input type="range" min="0" max="1" step="0.01" value="${tab.volume}">
        <span class="volume-value">${Math.round(tab.volume * 100)}%</span>
      </div>
    `;

    const slider = tabControl.querySelector('input[type="range"]');
    const volumeValue = tabControl.querySelector('.volume-value');
    const muteButton = tabControl.querySelector('.mute-button');
    const pauseButton = tabControl.querySelector('.pause-button');
    const removeButton = tabControl.querySelector('.remove-button');

    // Set initial slider fill
    setSliderFill(slider);

    // Update volume display
    function updateVolumeDisplay(value) {
      volumeValue.textContent = `${Math.round(value * 100)}%`;
      setSliderFill(slider);
    }

    // Handle volume slider changes
    slider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      updateVolumeDisplay(value);
      // Send message to background script to update tab volume
      chrome.runtime.sendMessage({
        action: 'setTabVolume',
        tabId: tab.id,
        volume: value
      });
    });

    // Ensure slider and value reflect actual tab volume on load
    updateVolumeDisplay(tab.volume);

    // Handle mute button click
    muteButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        action: 'toggleMute',
        tabId: tab.id
      }, (response) => {
        if (response && response.success) {
          muteButton.textContent = response.isMuted ? 'Unmute' : 'Mute';
        }
      });
    });

    // Handle pause button click
    pauseButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        action: 'togglePause',
        tabId: tab.id
      }, (response) => {
        if (response && response.success) {
          pauseButton.textContent = response.isPaused ? 'Play' : 'Pause';
        }
      });
    });

    // Handle remove button click
    removeButton.addEventListener('click', () => {
      removedTabs.add(tab.id);
      // Save removed tabs to chrome.storage
      chrome.storage.local.set({ removedTabs: Array.from(removedTabs) });
      tabControl.remove();
      if (tabsContainer.children.length === 0) {
        noTabsMessage.classList.remove('hidden');
        tabsContainer.classList.add('hidden');
      }
    });

    return tabControl;
  }

  // Update the popup with current tabs
  function updateTabsList(removedTabs) {
    chrome.runtime.sendMessage({ action: 'getTabsWithMedia' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting tabs:', chrome.runtime.lastError);
        return;
      }

      const tabs = response.tabs || [];
      // Clear current tabs
      tabsContainer.innerHTML = '';
      if (tabs.length === 0) {
        noTabsMessage.classList.remove('hidden');
        tabsContainer.classList.add('hidden');
      } else {
        noTabsMessage.classList.add('hidden');
        tabsContainer.classList.remove('hidden');
        // Add controls for each tab that hasn't been removed
        tabs.forEach(tab => {
          if (!removedTabs.has(tab.id)) {
            const tabControl = createTabControl(tab, removedTabs);
            tabsContainer.appendChild(tabControl);
          }
        });
      }
    });
  }

  // Handle refresh button click
  refreshButton.addEventListener('click', () => {
    chrome.storage.local.set({ removedTabs: [] }, () => {
      updateTabsList(new Set());
    });
  });

  // Update tabs list when popup opens
  chrome.storage.local.get(['removedTabs'], (result) => {
    const removedTabs = new Set(result.removedTabs || []);
    updateTabsList(removedTabs);
  });
}); 