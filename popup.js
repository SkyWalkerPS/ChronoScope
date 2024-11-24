document.addEventListener("DOMContentLoaded", () => {
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemaining = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
  }

  // Update the table with the latest time data
  function updateTable() {
    chrome.storage.local.get("domainTime", (result) => {
      const response = result.domainTime || {}; // Default to an empty object if no data is found
      const table = document.querySelector("#time-table");

      // Clear existing table content
      table.innerHTML = "<tr><th>Domain</th><th>Time Spent(s)</th><th>Action</th></tr>";

      // Loop through the response and add rows for each domain
      for (const [domain, time] of Object.entries(response)) {
        const row = `<tr>
                      <td>${domain}</td>
                      <td>${formatTime(Math.round(time))}</td>
                      <td><button class="remove-btn" data-domain="${domain}">X</button></td>
                    </tr>`;
        table.innerHTML += row;
      }

      // Add event listeners to each "X" button
      const removeButtons = document.querySelectorAll(".remove-btn");
      removeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const domainToRemove = button.getAttribute("data-domain");
          removeDomain(domainToRemove);
        });
      });
    });
  }

  // Function to remove a domain from storage and reset its time
  function removeDomain(domain) {
    chrome.storage.local.get("domainTime", (result) => {
      const currentDomainTime = result.domainTime || {};
      // Delete the domain from the object
      delete currentDomainTime[domain];
      // Update storage
      chrome.storage.local.set({ domainTime: currentDomainTime });
      updateTable();  // Update the table after removing the domain
    });
  }

  // Reset time for all domains
  const resetTimeBtn = document.getElementById("reset-time-btn");
  resetTimeBtn.addEventListener("click", () => {
    chrome.storage.local.set({ domainTime: {} });
    updateTable();  
  });

  updateTable();
  setInterval(updateTable, 1000);  // Update the table every second
});