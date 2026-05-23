// ============================================================
//  AAJKATEL.IN  --  app.js
//  Sab logic yahan hai. Content.js se copy uthata hai.
//  Prices: collectapi.com (free tier) + local fallback JSON
// ============================================================

// ---- CONFIG ----
const CONFIG = {
  // CollectAPI fuel prices (free, no key needed for basic calls via Netlify function)
  NETLIFY_PRICES_FN: "/.netlify/functions/get-prices",
  NETLIFY_REPORT_FN: "/.netlify/functions/report-price",

  // Cache duration: 3 hours (prices update once daily in India, but we cache conservatively)
  CACHE_DURATION_MS: 3 * 60 * 60 * 1000,
  CACHE_KEY: "aajkatel_prices_v2",

  // Reverse geocoding: nominatim (free, no key)
  GEOCODE_URL: "https://nominatim.openstreetmap.org/reverse",

  // Loading message cycle (ms)
  LOADING_MSG_INTERVAL: 1800,
};

// ---- STATE ----
let state = {
  city: null,
  state: null,
  petrol: null,
  diesel: null,
  lastUpdated: null,
  loadingMsgIndex: 0,
  loadingInterval: null,
};

// ---- DOM REFS ----
const $ = (id) => document.getElementById(id);

// ---- INIT ----
document.addEventListener("DOMContentLoaded", () => {
  populateContent();
  populateCitySuggestions();
  setupEventListeners();
  startLoadingMessages();
  tryAutoDetect();
});

// ---- POPULATE STATIC CONTENT ----
function populateContent() {
  const C = window.CONTENT;

  $("site-title").textContent = C.siteTitle;
  $("site-tagline").textContent = C.siteTagline;
  $("header-badge").textContent = C.headerBadge;
  $("location-text").textContent = C.locationDetecting;
  $("location-btn-text").textContent = C.locationBtnDefault;
  $("city-search").placeholder = C.searchPlaceholder;
  $("search-btn").textContent = C.searchBtn;
  $("report-toggle-text").textContent = C.reportToggleOpen;
  $("report-desc").textContent = C.reportDesc;
  $("report-submit-text").textContent = C.reportSubmit;
  $("report-thanks").textContent = C.reportThanks;
  $("footer-disclaimer").textContent = C.footerDisclaimer;
  $("footer-credit").textContent = C.footerCredit;
  $("footer-source-link").textContent = C.footerSourceLink;
  $("petrol-label").textContent = C.petrolLabel;
  $("diesel-label").textContent = C.dieselLabel;
  $("petrol-unit").textContent = C.perLitre;
  $("diesel-unit").textContent = C.perLitre;
  $("retry-btn").textContent = "Phir Se Try Karo";

  // Fun fact (rotates by day of year)
  const dayIndex = getDayOfYear() % C.funFacts.length;
  $("fun-fact-text").textContent = C.funFacts[dayIndex];
}

function populateCitySuggestions() {
  const dl = $("city-suggestions");
  CONTENT.topCities.forEach((city) => {
    const opt = document.createElement("option");
    opt.value = city;
    dl.appendChild(opt);
  });
}

// ---- EVENT LISTENERS ----
function setupEventListeners() {
  $("location-btn").addEventListener("click", handleLocationRequest);

  $("search-btn").addEventListener("click", handleCitySearch);
  $("city-search").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleCitySearch();
  });

  $("retry-btn").addEventListener("click", () => {
    if (state.city) fetchPrices(state.city);
    else handleLocationRequest();
  });

  $("report-toggle").addEventListener("click", toggleReportForm);
  $("report-submit").addEventListener("click", submitReport);
}

// ---- AUTO DETECT ----
function tryAutoDetect() {
  // Check cache first
  const cached = loadFromCache();
  if (cached) {
    state = { ...state, ...cached };
    renderPrices(cached);
    return;
  }
  // Then try geolocation silently
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      onGeoSuccess,
      () => { /* silent fail, user can click the button */ },
      { timeout: 5000, maximumAge: 600000 }
    );
  }
}

// ---- LOCATION HANDLING ----
function handleLocationRequest() {
  const C = window.CONTENT;
  $("location-btn-text").textContent = C.locationBtnDetecting;
  $("location-btn").disabled = true;

  if (!navigator.geolocation) {
    showError(C.errors.locationUnavailable);
    resetLocationBtn();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    onGeoSuccess,
    onGeoError,
    { timeout: 10000, maximumAge: 300000 }
  );
}

async function onGeoSuccess(position) {
  const { latitude, longitude } = position.coords;

  try {
    const city = await reverseGeocode(latitude, longitude);
    if (city) {
      fetchPrices(city);
    } else {
      showError(CONTENT.errors.locationUnavailable);
    }
  } catch (e) {
    showError(CONTENT.errors.generic);
  } finally {
    resetLocationBtn();
  }
}

function onGeoError(err) {
  const C = window.CONTENT;
  if (err.code === 1) {
    showError(C.errors.locationDenied);
  } else {
    showError(C.errors.locationUnavailable);
  }
  resetLocationBtn();
}

async function reverseGeocode(lat, lon) {
  const url = `${CONFIG.GEOCODE_URL}?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en-IN,en" },
  });
  const data = await res.json();

  const addr = data.address;
  // Try to extract city from multiple fields
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.county ||
    addr.state_district ||
    addr.state;

  if (city) {
    const stateName = addr.state || "";
    $("location-text").textContent = CONTENT.locationGranted(city, stateName);
    state.city = city;
    state.state = stateName;
  }

  return city;
}

function resetLocationBtn() {
  $("location-btn-text").textContent = CONTENT.locationBtnRetry;
  $("location-btn").disabled = false;
}

// ---- CITY SEARCH ----
function handleCitySearch() {
  const val = $("city-search").value.trim();
  if (!val) return;
  fetchPrices(val);
}

// ---- PRICE FETCHING ----
async function fetchPrices(city) {
  showLoading();
  startLoadingMessages();

  // Check cache
  const cached = loadFromCache(city);
  if (cached) {
    stopLoadingMessages();
    renderPrices(cached);
    return;
  }

  try {
    const url = `${CONFIG.NETLIFY_PRICES_FN}?city=${encodeURIComponent(city)}`;
    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("city_not_found");
      }
      throw new Error("fetch_failed");
    }

    const data = await res.json();

    if (!data.petrol || !data.diesel) {
      throw new Error("city_not_found");
    }

    const priceData = {
      city: data.city || city,
      stateInfo: data.state || "",
      petrol: parseFloat(data.petrol),
      diesel: parseFloat(data.diesel),
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };

    saveToCache(priceData);
    stopLoadingMessages();
    renderPrices(priceData);

    // Update page title
    document.title = CONTENT.pageTitle(priceData.city);

    // Update location bar
    $("location-text").textContent = CONTENT.locationGranted(
      priceData.city,
      priceData.stateInfo
    );

  } catch (err) {
    stopLoadingMessages();
    if (err.message === "city_not_found") {
      showError(CONTENT.errors.cityNotFound(city));
    } else {
      showError(CONTENT.errors.fetchFailed);
    }
  }
}

// ---- RENDER PRICES ----
function renderPrices(data) {
  const petrolParts = splitPrice(data.petrol);
  const dieselParts = splitPrice(data.diesel);

  $("petrol-whole").textContent = petrolParts.whole;
  $("petrol-decimal").textContent = petrolParts.decimal;
  $("diesel-whole").textContent = dieselParts.whole;
  $("diesel-decimal").textContent = dieselParts.decimal;

  // Price change indicators (if available)
  const petrolChange = data.petrolChange;
  const dieselChange = data.dieselChange;

  if (petrolChange !== undefined && petrolChange !== null) {
    const el = $("petrol-change");
    if (petrolChange > 0) {
      el.textContent = CONTENT.priceUp(petrolChange.toFixed(2));
      el.className = "price-change price-up";
    } else if (petrolChange < 0) {
      el.textContent = CONTENT.priceDown(Math.abs(petrolChange).toFixed(2));
      el.className = "price-change price-down";
    } else {
      el.textContent = CONTENT.priceNoChange;
      el.className = "price-change price-neutral";
    }
  }

  if (dieselChange !== undefined && dieselChange !== null) {
    const el = $("diesel-change");
    if (dieselChange > 0) {
      el.textContent = CONTENT.priceUp(dieselChange.toFixed(2));
      el.className = "price-change price-up";
    } else if (dieselChange < 0) {
      el.textContent = CONTENT.priceDown(Math.abs(dieselChange).toFixed(2));
      el.className = "price-change price-down";
    } else {
      el.textContent = CONTENT.priceNoChange;
      el.className = "price-change price-neutral";
    }
  }

  // Last updated
  const updatedEl = $("update-text");
  if (data.lastUpdated) {
    const d = new Date(data.lastUpdated);
    const timeStr = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
    updatedEl.textContent = CONTENT.updatedText(timeStr);
  } else {
    updatedEl.textContent = CONTENT.updatedJustNow;
  }

  // Show cards, hide loader
  $("price-loading").classList.add("hidden");
  $("price-error").classList.add("hidden");
  $("price-cards").classList.remove("hidden");
  $("update-info").classList.remove("hidden");
  $("report-section").classList.remove("hidden");

  // Animate in
  requestAnimationFrame(() => {
    $("price-cards").classList.add("visible");
    $("update-info").classList.add("visible");
  });

  state.petrol = data.petrol;
  state.diesel = data.diesel;
  state.city = data.city;
}

function splitPrice(price) {
  if (!price) return { whole: "--", decimal: "--" };
  const str = parseFloat(price).toFixed(2);
  const [whole, decimal] = str.split(".");
  return { whole, decimal };
}

// ---- LOADING STATES ----
function showLoading() {
  $("price-loading").classList.remove("hidden");
  $("price-error").classList.add("hidden");
  $("price-cards").classList.add("hidden");
  $("price-cards").classList.remove("visible");
  $("update-info").classList.add("hidden");
}

function showError(msg) {
  $("price-loading").classList.add("hidden");
  $("price-cards").classList.add("hidden");
  $("price-error").classList.remove("hidden");
  $("error-text").textContent = msg;
}

function startLoadingMessages() {
  stopLoadingMessages();
  const msgs = CONTENT.loadingMessages;
  let i = 0;
  $("loading-text").textContent = msgs[0];
  state.loadingInterval = setInterval(() => {
    i = (i + 1) % msgs.length;
    $("loading-text").textContent = msgs[i];
  }, CONFIG.LOADING_MSG_INTERVAL);
}

function stopLoadingMessages() {
  if (state.loadingInterval) {
    clearInterval(state.loadingInterval);
    state.loadingInterval = null;
  }
}

// ---- CACHE ----
function cacheKey(city) {
  return city
    ? `${CONFIG.CACHE_KEY}_${city.toLowerCase().replace(/\s/g, "_")}`
    : CONFIG.CACHE_KEY;
}

function saveToCache(data) {
  try {
    const entry = { data, ts: Date.now() };
    sessionStorage.setItem(cacheKey(data.city), JSON.stringify(entry));
  } catch (e) { /* storage may be unavailable */ }
}

function loadFromCache(city) {
  try {
    const raw = sessionStorage.getItem(cacheKey(city || ""));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.ts > CONFIG.CACHE_DURATION_MS) {
      sessionStorage.removeItem(cacheKey(city || ""));
      return null;
    }
    return entry.data;
  } catch (e) {
    return null;
  }
}

// ---- REPORT FORM ----
function toggleReportForm() {
  const form = $("report-form");
  const btn = $("report-toggle");
  const isHidden = form.classList.contains("hidden");

  if (isHidden) {
    form.classList.remove("hidden");
    btn.setAttribute("aria-expanded", "true");
    $("report-toggle-text").textContent = CONTENT.reportToggleClose;
    requestAnimationFrame(() => form.classList.add("visible"));
  } else {
    form.classList.remove("visible");
    btn.setAttribute("aria-expanded", "false");
    $("report-toggle-text").textContent = CONTENT.reportToggleOpen;
    setTimeout(() => form.classList.add("hidden"), 300);
  }
}

async function submitReport() {
  const C = window.CONTENT;
  const fuelType = $("report-type").value;
  const correctPrice = parseFloat($("report-price").value);
  const pumpName = $("report-pump").value.trim();

  if (!correctPrice || isNaN(correctPrice)) {
    $("report-submit-text").textContent = C.reportError;
    setTimeout(() => ($("report-submit-text").textContent = C.reportSubmit), 2000);
    return;
  }

  $("report-submit-text").textContent = C.reportSubmitting;
  $("report-submit").disabled = true;

  try {
    await fetch(CONFIG.NETLIFY_REPORT_FN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: state.city,
        fuelType,
        correctPrice,
        pumpName,
        reportedAt: new Date().toISOString(),
        currentPrice: fuelType === "petrol" ? state.petrol : state.diesel,
      }),
    });

    $("report-thanks").classList.remove("hidden");
    $("report-submit-text").textContent = C.reportSubmit;
    $("report-submit").disabled = false;
    $("report-price").value = "";
    $("report-pump").value = "";

    setTimeout(() => $("report-thanks").classList.add("hidden"), 4000);
  } catch (e) {
    $("report-submit-text").textContent = C.reportSubmit;
    $("report-submit").disabled = false;
  }
}

// ---- UTILS ----
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
