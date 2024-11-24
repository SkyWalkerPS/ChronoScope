document.addEventListener("DOMContentLoaded", () => {
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemaining = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
  }

  
  function updateTable() {
    chrome.storage.local.get("domainTime", (result) => {
      const response = result.domainTime || {}; 
      const table = document.querySelector("#time-table");      
      table.innerHTML = "<tr><th>Domain</th><th>Time Spent(s)</th><th>Action</th></tr>";

      
      for (const [domain, time] of Object.entries(response)) {
        const row = `<tr>
                      <td>${domain}</td>
                      <td>${formatTime(Math.round(time))}</td>
                      <td><button class="remove-btn" data-domain="${domain}">X</button></td>
                    </tr>`;
        table.innerHTML += row;
      }

      
      const removeButtons = document.querySelectorAll(".remove-btn");
      removeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const domainToRemove = button.getAttribute("data-domain");
          removeDomain(domainToRemove);
        });
      });
    });
  }

  
  function removeDomain(domain) {
    chrome.storage.local.get("domainTime", (result) => {
      const currentDomainTime = result.domainTime || {};
      delete currentDomainTime[domain];
      chrome.storage.local.set({ domainTime: currentDomainTime });
      updateTable();  
    });
  }

  
  const resetTimeBtn = document.getElementById("reset-time-btn");
  resetTimeBtn.addEventListener("click", () => {
    chrome.storage.local.set({ domainTime: {} });
    updateTable();  
  });

  updateTable();
  setInterval(updateTable, 1000);  
});