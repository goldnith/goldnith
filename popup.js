import { addBlockedSite } from "./dynamicrule.js";

const blocklistInput = document.getElementById("newSite");
const addSiteButton = document.getElementById("addSite");
const siteInput = document.getElementById("siteInput");

document.getElementById("addSiteButton").addEventListener("click", () => {
  const siteInput = document.getElementById("siteInput").value.trim();
  if (siteInput) {
    addBlockedSite(siteInput); // Add site to blocklist
    document.getElementById("siteInput").value = ""; // Clear input
  }
});
addSiteButton.addEventListener("click", () => {
  const site = siteInput.value.trim();
  if (site) {
    addBlockedSite(site); // Call the function to add a blocking rule
    siteInput.value = ""; // Clear input field
  }
});