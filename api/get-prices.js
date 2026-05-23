// ============================================================
//  AAJKATEL.IN  --  api/get-prices.js
//  Netlify Function: fetches fuel prices for a given city
//
//  Data source: CollectAPI (free plan, 100 requests/day)
//  Sign up at https://collectapi.com/ and get a free API key.
//  Set env var COLLECT_API_KEY in Netlify dashboard.
//
//  Fallback: Static prices.json (updated manually or via
//  the scheduled update GitHub Action in .github/workflows/)
// ============================================================

const https = require("https");
const path = require("path");
const fs = require("fs");

// Netlify function handler
exports.handler = async function (event) {
  const city = (event.queryStringParameters?.city || "").trim();

  if (!city) {
    return jsonResponse(400, { error: "city parameter required" });
  }

  // 1. Try live API
  try {
    const liveData = await fetchFromCollectAPI(city);
    if (liveData) {
      return jsonResponse(200, liveData);
    }
  } catch (e) {
    console.error("CollectAPI error:", e.message);
  }

  // 2. Fallback: static JSON in /data/prices.json
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

// ---- CollectAPI integration ----
function fetchFromCollectAPI(city) {
  const apiKey = process.env.COLLECT_API_KEY;

  if (!apiKey) {
    console.warn("COLLECT_API_KEY not set, skipping live fetch");
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const cityEncoded = encodeURIComponent(city);
    const options = {
      hostname: "api.collectapi.com",
      path: `/economy/fuelPrice?city=${cityEncoded}`,
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

          if (!parsed.success || !parsed.result?.length) {
            resolve(null);
            return;
          }

          // CollectAPI returns array of {fuelType, price, state}
          const results = parsed.result;
          let petrol = null;
          let diesel = null;
          let stateName = "";

          results.forEach((item) => {
            const type = (item.fuelType || "").toLowerCase();
            const price = parseFloat(item.price);
            if (type.includes("petrol") && !petrol) {
              petrol = price;
              stateName = item.state || "";
            }
            if (type.includes("diesel") && !diesel) {
              diesel = price;
            }
          });

          if (!petrol || !diesel) {
            resolve(null);
            return;
          }

          resolve({
            city: results[0]?.city || city,
            state: stateName,
            petrol: petrol.toFixed(2),
            diesel: diesel.toFixed(2),
            lastUpdated: new Date().toISOString(),
            source: "collectapi",
          });
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error("API timeout"));
    });
    req.end();
  });
}

// ---- Static fallback ----
function loadFallback(city) {
  // __dirname in Netlify functions is the api/ directory
  // prices.json is at data/prices.json from project root
  const dataPath = path.join(__dirname, "..", "data", "prices.json");

  if (!fs.existsSync(dataPath)) return null;

  const raw = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw);

  const cityLower = city.toLowerCase();
  const match = Object.keys(data).find(
    (k) => k.toLowerCase() === cityLower
  );

  if (!match) return null;

  const entry = data[match];
  return {
    city: match,
    state: entry.state || "",
    petrol: entry.petrol,
    diesel: entry.diesel,
    lastUpdated: entry.lastUpdated || null,
  };
}

// ---- Helper ----
function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600", // cache 1hr at CDN
    },
    body: JSON.stringify(body),
  };
}
