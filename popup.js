document.addEventListener("DOMContentLoaded", () => {
  let isDayWiseView = false;  // Flag to track if we are viewing the daily breakdown

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemaining = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
  }

  function updateTable() {
    chrome.storage.local.get("domainTime", (result) => {
      const response = result.domainTime || {}; 
      const resetBtn = document.querySelector("#reset-time-btn");
      resetBtn.style.display = "block";
      const table = document.querySelector("#time-table");      
      table.innerHTML = "<tr><th>Domain</th><th>Time Spent(s)</th><th>Action</th></tr>";

      for (const [domain, timeData] of Object.entries(response)) {
        const totalTime = Object.values(timeData).reduce((a, b) => a + b, 0);
        const row = `<tr data-domain="${domain}">
                      <td>${domain}</td>
                      <td>${formatTime(Math.round(totalTime))}</td>
                      <td><button class="remove-btn" data-domain="${domain}">X</button></td>
                    </tr>`;
        table.innerHTML += row;
      }

      document.querySelectorAll("tr[data-domain]").forEach((row) => {
        row.addEventListener("click", () => {
          const domain = row.getAttribute("data-domain");
          showDailyBreakdown(domain);
        });
      });

      const removeButtons = document.querySelectorAll(".remove-btn");
      removeButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const domainToRemove = button.getAttribute("data-domain");
          removeDomain(domainToRemove);
        });
      });
    });
  }

  function showDailyBreakdown(domain) {
    isDayWiseView = true;  // Set flag to true when viewing the daily breakdown

    chrome.storage.local.get("domainTime", (result) => {
      const domainData = result.domainTime?.[domain] || {};
      const resetBtn = document.querySelector("#reset-time-btn");
      resetBtn.style.display = "none";

      const table = document.querySelector("#time-table");
      table.innerHTML = "<tr><th>Date</th><th>Time Spent</th></tr>";

      for (const [date, time] of Object.entries(domainData)) {
        const row = `<tr><td>${date}</td><td>${formatTime(Math.round(time))}</td></tr>`;
        table.innerHTML += row;
      }

      // Add back button
      const backButton = `<button id="back-btn">Back</button>`;
      table.innerHTML += backButton;

      // Event listener for the back button
      document.getElementById("back-btn").addEventListener("click", () => {
        isDayWiseView = false;  // Set flag back to false
        updateTable();  // Restart the table updates
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

  setInterval(() => {
    if (!isDayWiseView) {  // Only update the table when not in daywise view
      updateTable();
    }
  }, 1000);

  updateTable();
});