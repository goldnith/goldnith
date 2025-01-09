
import * as nsfwjs from "nsfwjs";


// Keywords for blocking
const blockedKeywords = ["explicit", "adult", "NSFW", "nude", "sex", "porn", "porno"];
const API_KEY = "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"; // Secure this in production

const THROTTLE_DELAY = 2000; // 2 seconds
let lastModerationTime = 0;
const moderationCache = new Map();

async function scanPageContent() {
  const text = document.body.innerText;

  // Keyword-based moderation
  if (blockedKeywords.some((word) => new RegExp(`\\b${word}s?\\b`, "i").test(text))) {
    displayBlockedMessage("Text contains blocked keywords.");
    return;
  }

  // Hugging Face API for toxicity analysis
  await moderateTextOptimized(text);
}

async function moderateTextOptimized(text) {
  const now = Date.now();

  // Throttle requests
  if (now - lastModerationTime < THROTTLE_DELAY) {
    console.log("Throttled: Skipping moderation.");
    return;
  }

  lastModerationTime = now;

  // Check cache
  if (moderationCache.has(text)) {
    console.log("Cache hit: Using cached result.");
    handleModerationResult(moderationCache.get(text));
    return;
  }

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/unitary/toxic-bert", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    moderationCache.set(text, result); // Cache result
    handleModerationResult(result);
  } catch (error) {
    console.error("Error during moderation:", error);
  }
}

function handleModerationResult(result) {
  const toxicityScore = result[0]?.score || 0;
  if (toxicityScore > 0.7) {
    displayBlockedMessage("Text contains toxic content.");
  } else {
    console.log("Content is safe.");
    displaySafeMessage();
  }
}

async function scanImages() {
  try {
    const images = document.querySelectorAll("img");
    const model = await nsfwjs.load();

    const imagePromises = Array.from(images).map(async (img) => {
      try {
        const predictions = await model.classify(img);

        if (predictions.some((pred) => pred.className === "Porn" && pred.probability > 0.7)) {
          console.log("Explicit image detected:", img.src);
          img.style.display = "none"; // Hide image
        }
      } catch (error) {
        console.error("Error classifying image:", img.src, error);
      }
    });

    await Promise.all(imagePromises); // Process all images in parallel
    console.log("Image moderation completed.");
  } catch (error) {
    console.error("Error loading NSFW.js model:", error);
  }
}

function displayBlockedMessage(reason) {
  document.body.innerHTML = `<h1>Blocked Content</h1><p>Reason: ${reason}</p>`;
}

function displaySafeMessage() {
  document.body.innerHTML = "<h1>Content is safe.</h1>";
}

// Run moderation checks
(async function runModerationChecks() {
  document.body.innerHTML = "<h1>Content under review...</h1>"; // Temporary status message
  await scanPageContent();
  await scanImages();
})();


