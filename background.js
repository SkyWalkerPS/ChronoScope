let activeTab = null;
let isActive = false;


chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    activeTab = new URL(tab.url).hostname;
    isActive = true;
  });
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    activeTab = new URL(tab.url).hostname;
    isActive = tab.active;
  }
});


chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    isActive = false;
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        activeTab = new URL(tabs[0].url).hostname;
        isActive = true;
      }
    });
  }
});


setInterval(() => {
  if (activeTab && isActive) {
    recordTime();
  }
}, 1000);


function recordTime() {
  if (activeTab && isActive) {
    chrome.storage.local.get("domainTime", (result) => {
      const currentDomainTime = result.domainTime || {};
      currentDomainTime[activeTab] = (currentDomainTime[activeTab] || 0) + 1;
      chrome.storage.local.set({ domainTime: currentDomainTime });
    });
  }
}