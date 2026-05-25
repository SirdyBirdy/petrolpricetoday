// ============================================================
//  AAJKATEL.IN  --  api/get-prices.js
//  Netlify Function: fetches fuel prices for a given city.
//
//  Priority order:
//    1. CollectAPI live (only if COLLECT_API_KEY env var is set)
//    2. data/prices.json (updated daily by GitHub Action)
//
//  data/prices.json lives at the project root /data/prices.json.
//  The GitHub Action keeps it fresh every morning at 6:30 AM IST.
// ============================================================

const https = require("https");
const path  = require("path");
const fs    = require("fs");

exports.handler = async function (event) {
  const city = (event.queryStringParameters?.city || "").trim();

  if (!city) {
    return jsonResponse(400, { error: "city parameter required" });
  }

  // 1. Try CollectAPI live (only when key is set)
  if (process.env.COLLECT_API_KEY) {
    try {
      const liveData = await fetchFromCollectAPI(city);
      if (liveData) return jsonResponse(200, liveData);
    } catch (e) {
      console.error("CollectAPI error:", e.message);
    }
  }

  // 2. Fallback: data/prices.json (updated daily by GitHub Action)
  try {
    const fallback = loadFallback(city);
    if (fallback) {
      return jsonResponse(200, { ...fallback, source: "fallback" });
    }
  } catch (e) {
    console.error("Fallback load error:", e.message);
  }

  return jsonResponse(404, { error: "city_not_found" });
};

// ---- CollectAPI ----
function fetchFromCollectAPI(city) {
  const apiKey = process.env.COLLECT_API_KEY;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.collectapi.com",
      path: `/economy/fuelPrice?city=${encodeURIComponent(city)}`,
      method: "GET",
      headers: {
        "content-type": "application/json",
        "authorization": `apikey ${apiKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (!parsed.success || !parsed.result?.length) { resolve(null); return; }

          let petrol = null, diesel = null, stateName = "";
          parsed.result.forEach((item) => {
            const type = (item.fuelType || "").toLowerCase();
            const price = parseFloat(item.price);
            if (type.includes("petrol") && !petrol) { petrol = price; stateName = item.state || ""; }
            if (type.includes("diesel") && !diesel)   diesel = price;
          });

          if (!petrol || !diesel) { resolve(null); return; }

          resolve({
            city: parsed.result[0]?.city || city,
            state: stateName,
            petrol: petrol.toFixed(2),
            diesel: diesel.toFixed(2),
            lastUpdated: new Date().toISOString(),
            source: "collectapi",
          });
        } catch (e) { reject(e); }
      });
    });

    req.on("error", reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error("API timeout")); });
    req.end();
  });
}

// ---- Static fallback ----
function loadFallback(city) {
  // __dirname = api/  →  data/prices.json is at ../data/prices.json
  const dataPath = path.join(__dirname, "..", "data", "prices.json");

  if (!fs.existsSync(dataPath)) {
    console.error("prices.json not found at:", dataPath);
    return null;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const cityLower = city.toLowerCase();

  const match = Object.keys(data).find(
    (k) => k.toLowerCase() === cityLower
  );

  if (!match) return null;

  const entry = data[match];
  return {
    city:         match,
    state:        entry.state        || "",
    petrol:       entry.petrol,
    diesel:       entry.diesel,
    petrolChange: entry.petrolChange ?? null,
    dieselChange: entry.dieselChange ?? null,
    lastUpdated:  entry.lastUpdated  || null,
  };
}

// ---- Helper ----
function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
    body: JSON.stringify(body),
  };
}
