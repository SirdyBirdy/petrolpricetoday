// ============================================================
//  AAJKATEL.IN  --  .github/scripts/update-prices.js
//
//  Scrapes mypetrolprice.com for petrol + diesel prices for
//  every city in our list, then writes data/prices.json.
//
//  Source: mypetrolprice.com  (updated daily at 6 AM IST)
//  URL pattern:
//    /{cityId}/Petrol-price-in-{CitySlug}
//    /{cityId}/Diesel-price-in-{CitySlug}
//
//  Run manually:  node .github/scripts/update-prices.js
// ============================================================

const fetch  = require("node-fetch");
const cheerio = require("cheerio");
const fs     = require("fs");
const path   = require("path");

// ---- CITY MAP ----
// Format: "Display Name": { id, slug, state }
// id   = mypetrolprice.com city numeric ID (from their URLs)
// slug = URL slug they use (City_Name with underscores for spaces)
const CITIES = {
  "Mumbai":         { id: 3,   slug: "Mumbai",         state: "Maharashtra" },
  "Delhi":          { id: 2,   slug: "Delhi",           state: "Delhi" },
  "Bengaluru":      { id: 6,   slug: "Bengaluru",       state: "Karnataka" },
  "Chennai":        { id: 5,   slug: "Chennai",         state: "Tamil Nadu" },
  "Kolkata":        { id: 4,   slug: "Kolkata",         state: "West Bengal" },
  "Hyderabad":      { id: 8,   slug: "Hyderabad",       state: "Telangana" },
  "Pune":           { id: 7,   slug: "Pune",            state: "Maharashtra" },
  "Ahmedabad":      { id: 9,   slug: "Ahmedabad",       state: "Gujarat" },
  "Jaipur":         { id: 11,  slug: "Jaipur",          state: "Rajasthan" },
  "Lucknow":        { id: 13,  slug: "Lucknow",         state: "Uttar Pradesh" },
  "Patna":          { id: 18,  slug: "Patna",           state: "Bihar" },
  "Bhopal":         { id: 16,  slug: "Bhopal",          state: "Madhya Pradesh" },
  "Chandigarh":     { id: 20,  slug: "Chandigarh",      state: "Chandigarh" },
  "Surat":          { id: 10,  slug: "Surat",           state: "Gujarat" },
  "Indore":         { id: 17,  slug: "Indore",          state: "Madhya Pradesh" },
  "Nagpur":         { id: 15,  slug: "Nagpur",          state: "Maharashtra" },
  "Varanasi":       { id: 64,  slug: "Varanasi",        state: "Uttar Pradesh" },
  "Kanpur":         { id: 14,  slug: "Kanpur",          state: "Uttar Pradesh" },
  "Agra":           { id: 63,  slug: "Agra",            state: "Uttar Pradesh" },
  "Meerut":         { id: 66,  slug: "Meerut",          state: "Uttar Pradesh" },
  "Ghaziabad":      { id: 67,  slug: "Ghaziabad",       state: "Uttar Pradesh" },
  "Noida":          { id: 68,  slug: "Noida",           state: "Uttar Pradesh" },
  "Gurugram":       { id: 71,  slug: "Gurugram",        state: "Haryana" },
  "Faridabad":      { id: 72,  slug: "Faridabad",       state: "Haryana" },
  "Ranchi":         { id: 19,  slug: "Ranchi",          state: "Jharkhand" },
  "Dehradun":       { id: 22,  slug: "Dehradun",        state: "Uttarakhand" },
  "Prayagraj":      { id: 65,  slug: "Prayagraj",       state: "Uttar Pradesh" },
  "Allahabad":      { id: 65,  slug: "Prayagraj",       state: "Uttar Pradesh" },
  "Gorakhpur":      { id: 69,  slug: "Gorakhpur",       state: "Uttar Pradesh" },
  "Guwahati":       { id: 23,  slug: "Guwahati",        state: "Assam" },
  "Bhubaneswar":    { id: 25,  slug: "Bhubaneswar",     state: "Odisha" },
  "Coimbatore":     { id: 36,  slug: "Coimbatore",      state: "Tamil Nadu" },
  "Kochi":          { id: 26,  slug: "Kochi",           state: "Kerala" },
  "Visakhapatnam":  { id: 134, slug: "Vizag",           state: "Andhra Pradesh" },
  "Vijayawada":     { id: 54,  slug: "Vijayawada",      state: "Andhra Pradesh" },
  "Madurai":        { id: 37,  slug: "Madurai",         state: "Tamil Nadu" },
  "Nashik":         { id: 40,  slug: "Nashik",          state: "Maharashtra" },
  "Aurangabad":     { id: 41,  slug: "Aurangabad",      state: "Maharashtra" },
  "Solapur":        { id: 42,  slug: "Solapur",         state: "Maharashtra" },
  "Jodhpur":        { id: 45,  slug: "Jodhpur",         state: "Rajasthan" },
  "Udaipur":        { id: 46,  slug: "Udaipur",         state: "Rajasthan" },
};

// ---- CONSTANTS ----
const BASE_URL    = "https://www.mypetrolprice.com";
const OUTPUT_PATH = path.join(__dirname, "..", "..", "data", "prices.json");
const DELAY_MS    = 1200; // be polite, don't hammer the server
const MAX_RETRIES = 2;

// ---- HELPERS ----
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(url, retries = MAX_RETRIES) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AajKaTelBot/1.0; +https://aajkatel.in)",
        "Accept": "text/html",
        "Accept-Language": "en-IN,en;q=0.9",
      },
      timeout: 10000,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    if (retries > 0) {
      console.warn(`  Retry (${retries} left) for ${url}: ${err.message}`);
      await sleep(2000);
      return fetchPage(url, retries - 1);
    }
    throw err;
  }
}

function extractPrice(html) {
  const $ = cheerio.load(html);

  // mypetrolprice shows the current price in an <h1> or a strong tag
  // The pattern is: ₹ XX.XX per Liter in the page heading
  // Also available in the history table's first row

  // Try the heading first: "Current Petrol Price in Delhi is ₹ 94.81 per Liter"
  const headingText = $("h2").text() + $("h1").text();
  const headingMatch = headingText.match(/₹\s*([\d]+\.[\d]{2})/);
  if (headingMatch) return parseFloat(headingMatch[1]);

  // Fallback: grab the first bold price in the history table
  const tableMatch = $("table").first().find("strong, b").first().text();
  const tablePrice = tableMatch.match(/([\d]+\.[\d]{2})/);
  if (tablePrice) return parseFloat(tablePrice[1]);

  // Last resort: any ₹ XX.XX pattern on the page
  const pageText = $.text();
  const anyMatch = pageText.match(/₹\s*([\d]{2,3}\.[\d]{2})/);
  if (anyMatch) return parseFloat(anyMatch[1]);

  return null;
}

function extractPriceChange(html) {
  const $ = cheerio.load(html);
  // Look for change in format "(+0.87)" or "(-0.23)" or "(0.00)"
  const pageText = $("body").text();
  const changeMatch = pageText.match(/\(([+-]?[\d]+\.[\d]{2})\)/);
  if (changeMatch) {
    return parseFloat(changeMatch[1]);
  }
  return 0;
}

// ---- MAIN ----
async function run() {
  console.log(`\n🛢  AajKaTel price updater`);
  console.log(`   Source: mypetrolprice.com`);
  console.log(`   Cities: ${Object.keys(CITIES).length}`);
  console.log(`   Started: ${new Date().toISOString()}\n`);

  // Load existing prices.json so we can keep old data if a fetch fails
  let existing = {};
  try {
    if (fs.existsSync(OUTPUT_PATH)) {
      existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
    }
  } catch (e) {
    console.warn("Could not load existing prices.json, starting fresh.");
  }

  const output = {
    _note: "Fallback prices. Auto-updated daily by GitHub Action. Prices in INR per litre.",
    _lastUpdated: new Date().toISOString().split("T")[0],
  };

  const today = new Date().toISOString().split("T")[0];
  let successCount = 0;
  let failCount = 0;

  // We'll track seen IDs to avoid double-fetching Allahabad/Prayagraj
  const fetchedIds = new Set();
  const idToResult = {};

  for (const [cityName, meta] of Object.entries(CITIES)) {
    const key = `${meta.id}_${meta.slug}`;

    // If already fetched this city ID (e.g. Allahabad = Prayagraj), reuse
    if (fetchedIds.has(key)) {
      const prev = idToResult[key];
      if (prev) {
        output[cityName] = { ...prev };
        console.log(`  ♻  ${cityName} (reused from ${meta.slug})`);
      }
      continue;
    }

    fetchedIds.add(key);

    try {
      const petrolUrl = `${BASE_URL}/${meta.id}/Petrol-price-in-${meta.slug}`;
      const dieselUrl = `${BASE_URL}/${meta.id}/Diesel-price-in-${meta.slug}`;

      process.stdout.write(`  ⏳ ${cityName}... `);

      const [petrolHtml, dieselHtml] = await Promise.all([
        fetchPage(petrolUrl),
        fetchPage(dieselUrl),
      ]);

      const petrol = extractPrice(petrolHtml);
      const diesel = extractPrice(dieselHtml);
      const petrolChange = extractPriceChange(petrolHtml);
      const dieselChange = extractPriceChange(dieselHtml);

      if (!petrol || !diesel) {
        throw new Error(`Could not parse price (petrol=${petrol}, diesel=${diesel})`);
      }

      const entry = {
        state:         meta.state,
        petrol:        petrol.toFixed(2),
        diesel:        diesel.toFixed(2),
        petrolChange:  petrolChange,
        dieselChange:  dieselChange,
        lastUpdated:   today,
      };

      output[cityName] = entry;
      idToResult[key]  = entry;
      successCount++;

      console.log(`✅ petrol ₹${petrol} diesel ₹${diesel}`);

    } catch (err) {
      failCount++;
      console.log(`❌ FAILED: ${err.message}`);

      // Keep old data so the site doesn't break
      const oldKey = Object.keys(existing).find(
        (k) => k.toLowerCase() === cityName.toLowerCase()
      );
      if (oldKey && existing[oldKey].petrol) {
        output[cityName] = {
          ...existing[oldKey],
          _stale: true,
        };
        console.log(`     ↪ kept stale data from ${existing[oldKey].lastUpdated}`);
      }
    }

    await sleep(DELAY_MS);
  }

  // Write output
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Success: ${successCount}  ❌ Failed: ${failCount}`);
  console.log(`📁 Written: ${OUTPUT_PATH}`);
  console.log(`⏱  Finished: ${new Date().toISOString()}\n`);

  if (failCount > 0 && successCount === 0) {
    console.error("All fetches failed — source may be down or changed structure.");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
