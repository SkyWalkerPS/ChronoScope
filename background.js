let activeTab = null;
let startTime = null;
let isTabActive = true; // Track whether the tab is focused or not

// Listen for tab activation (when the tab becomes focused)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log(tab);
    // Check if the tab is active and if its visibility state is focused
    if (tab.active) {
      activeTab = new URL(tab.url).hostname; // Get the domain of the active tab
      isTabActive = true;
      startTime = Date.now(); // Reset the start time when tab is focused
    } else {
      isTabActive = false; // Tab is not active (focused)
    }
  });
});

// Listen for tab updates (e.g., URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If the tab's URL changes, update the active domain and reset the timer
  if (changeInfo.url) {
    activeTab = new URL(tab.url).hostname;
    startTime = Date.now(); // Reset the start time when the tab's URL changes
    isTabActive = tab.active; // If the tab is active, set the flag accordingly
  }
});

// Periodically update the time every second for the active tab, but only if the tab is focused
setInterval(() => {
  if (activeTab && startTime && isTabActive) {
    recordTime();
  }
}, 1000);

// Record time spent on a domain
function recordTime() {
  if (activeTab && startTime && isTabActive) {
    const elapsedTime = (Date.now() - startTime) / 1000;
    startTime = Date.now();
    chrome.storage.local.get("domainTime", (result) => {
      const currentDomainTime = result.domainTime || {};
      currentDomainTime[activeTab] = (currentDomainTime[activeTab] || 0) + elapsedTime;
      chrome.storage.local.set({ domainTime: currentDomainTime });
    });
  }
}