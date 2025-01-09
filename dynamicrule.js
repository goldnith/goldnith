let ruleIdCounter = 1; // Keep track of rule IDs

function addBlockedSite(site) {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      addRules: [
        {
          id: ruleIdCounter++, // Incremental ID
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: `*://*.${site}/*`,
            resourceTypes: ["main_frame"]
          }
        }
      ],
      removeRuleIds: []
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Error updating rules:", chrome.runtime.lastError.message);
      } else {
        console.log(`Added blocking rule for: ${site}`);
      }
    }
  );
}

  
  // Example usage:
  addBlockedSite("badsite.com");
  