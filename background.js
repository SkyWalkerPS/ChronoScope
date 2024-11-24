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


function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}

function recordTime() {
  const today = getTodayDate();
  if (activeTab && isActive) {
    chrome.storage.local.get("domainTime", (result) => {
      const currentDomainTime = result.domainTime || {};
      if (!currentDomainTime[activeTab]) currentDomainTime[activeTab] = {};
      if (!currentDomainTime[activeTab][today]) currentDomainTime[activeTab][today] = 0;
      currentDomainTime[activeTab][today] += 1;
      chrome.storage.local.set({ domainTime: currentDomainTime });
    });
  }
}