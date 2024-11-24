let activeTab = null;
let isActive = false;

// Handle tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    activeTab = new URL(tab.url).hostname;
    isActive = true;
  });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    activeTab = new URL(tab.url).hostname;
    isActive = tab.active;
  }
});

// Detect when the browser window loses or gains focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // User switched to another application or desktop
    isActive = false;
  } else {
    // Browser regained focus
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        activeTab = new URL(tabs[0].url).hostname;
        isActive = true;
      }
    });
  }
});

// Periodically check the active tab and update time
setInterval(() => {
  if (activeTab && isActive) {
    recordTime();
  }
}, 1000);

// Record time for the active tab
function recordTime() {
  if (activeTab && isActive) {
    chrome.storage.local.get("domainTime", (result) => {
      const currentDomainTime = result.domainTime || {};
      currentDomainTime[activeTab] = (currentDomainTime[activeTab] || 0) + 1;
      chrome.storage.local.set({ domainTime: currentDomainTime });
    });
  }
}