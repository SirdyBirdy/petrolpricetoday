// ============================================================
//  AAJKATEL.IN  --  content.js
//  Yahan sab copy hai. Prices yahan nahi hai, wo app.js mein hai.
//  Edit karo, enjoy karo, panic mat karo.
// ============================================================

const CONTENT = {

  // ---------- HEADER ----------
  siteTitle: "AAJ KA TEL BHAV",
  siteTagline: "Petrol pumpa mein jaane se pehle jaan lo bhai",
  headerBadge: "⛽ LIVE",

  // ---------- LOCATION ----------
  locationDetecting: "Shehar dhundh rahe hain...",
  locationGranted: (city, state) => `${city}, ${state}`,
  locationDenied: "Location nahi mila re bhai",
  locationError: "GPS ne dhoka de diya",
  locationBtnDefault: "Mera Shehar Batao",
  locationBtnDetecting: "Dhundh rahe hain...",
  locationBtnRetry: "Dobara Dhundo",

  // ---------- SEARCH ----------
  searchPlaceholder: "Ya seedha likho shehar ka naam...",
  searchBtn: "Khojo",

  // ---------- LOADING STATES ----------
  loadingMessages: [
    "Pump se bhav maang rahe hain...",
    "Bhaiya ne abhi abhi rate board dekha...",
    "IOCL se number maang rahe hain...",
    "Server bhi thoda soch raha hai...",
    "Petrol wale se baat ho rahi hai...",
  ],

  // ---------- ERROR STATES ----------
  errors: {
    locationDenied: "Arre bhai location to do! Kahan ka bhav batayein hum? Pata hi nahi toh price kaise milega.",
    locationUnavailable: "Location service band hai kya? Settings mein jaake on karo bhai.",
    cityNotFound: (city) => `"${city}" nahi mila bhai. Sahi naam likho, Patna likho Patna, Lucknow likho Lucknow.`,
    fetchFailed: "Net thoda slow hai ya server ne mooh mod liya. Ek minute mein phir try karo.",
    generic: "Kuch gadbad ho gayi. Refresh karo bhai, sab theek ho jayega.",
  },

  // ---------- PRICE LABELS ----------
  petrolLabel: "PETROL",
  dieselLabel: "DIESEL",
  perLitre: "per litre",

  // ---------- PRICE CHANGE ----------
  priceUp: (amount) => `+${amount} badhaa aaj`,
  priceDown: (amount) => `-${amount} ghata aaj`,
  priceNoChange: "Aaj koi change nahi",
  priceChangeUnknown: "",

  // ---------- LAST UPDATED ----------
  updatedText: (timeStr) => `Aakhri baar ${timeStr} mein update hua`,
  updatedJustNow: "Abhi abhi update hua",

  // ---------- REPORT SECTION ----------
  reportToggleOpen: "Galat bhav lag raha hai? Batao bhai 🚩",
  reportToggleClose: "Band karo yeh",
  reportDesc: "Agar tumhare petrol pump pe alag price dikh raha hai, toh yahan batao. Hum dekh lenge.",
  reportThanks: "Shukriya bhai! Teri report mil gayi. Jaldi sahi kar denge.",
  reportSubmit: "Bhej Do Report",
  reportSubmitting: "Bhej rahe hain...",
  reportFuelType: "Kaun sa tel?",
  reportCorrectPrice: "Sahi bhav (per litre)",
  reportPumpName: "Pump ka naam (optional)",
  reportPumpPlaceholder: "e.g. HP Petrol Pump, MG Road",
  reportPricePlaceholder: "e.g. 94.72",
  reportError: "Bhai kuch to bharo pehle!",

  // ---------- FUN FACTS (rotates daily) ----------
  funFacts: [
    "India mein petrol pe 100 rupaye ka tax hai aur 50 rupaye ka petrol. Seedha bol do na ki tax bharo!",
    "Sabse mehenga petrol Rajasthan mein milta hai. Wahan jaoge toh cycle pe jaana.",
    "Diesel pe truck wale zinda hain, aur truck wale zinda hain toh sabzi bazar zinda hai. So basically diesel ne India chalaya hua hai.",
    "2008 mein petrol 45 rupaye tha. Uske baad se sirf rishte aur petrol dono mehenga hua.",
    "CNG wale log yahan aake sirf haath hila ke jaate hain. Unkа kuch nahi bigdega.",
    "Petrol pump pe full tank karwana ek emotional investment hai. Paise gaye, dil bhi gaya.",
    "Ek litre petrol se kareeb 12-15 km chalti hai gaadi. Ek litre chai se 0 km. Choose wisely.",
    "OPEC ne ek baar price badhaaya, India ke 140 crore logo ne ek saath andar ki saans li.",
    "Electric car walo ke paas yeh app download karne ki koi zaroorat nahi. Par phir bhi aaye hain, to swagat hai.",
    "Petrol pump pe zyada rona mat, pump wala bhi usi ki daali pe baitha hai.",
    "Price dekhke shock lag raha hai? Ek kaam karo, cycle kharido. Environment bhi bachega, paise bhi.",
    "Agar petrol ki jagah chai bechte toh India ka current account deficit nahi hota.",
  ],

  // ---------- FOOTER ----------
  footerDisclaimer: "Yeh prices informational hain. Exact bhav pump pe jake confirm karo. Hum responsible nahi hain agar price alag nikla.",
  footerCredit: "Banaya pyaar se. Data: PPAC / IOC / crowd reports.",
  footerSourceLink: "Data Source",

  // ---------- SHARE ----------
  shareTitle: (city) => `Aaj ${city} mein petrol ka bhav dekho`,
  shareText: (city, petrol, diesel) =>
    `${city} mein aaj petrol ₹${petrol}/L aur diesel ₹${diesel}/L chal raha hai. Aajkatel.in pe check karo!`,

  // ---------- PAGE TITLES (dynamic) ----------
  pageTitle: (city) => `${city} Petrol & Diesel Price Today | Aaj Ka Tel Bhav`,
  pageTitleDefault: "Aaj Ka Tel Bhav | India Fuel Price Live",

  // ---------- CITY SUGGESTIONS (top cities) ----------
  topCities: [
    "Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata",
    "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
    "Patna", "Bhopal", "Chandigarh", "Surat", "Indore",
    "Nagpur", "Varanasi", "Kanpur", "Agra", "Meerut",
    "Ghaziabad", "Noida", "Gurugram", "Faridabad", "Ranchi",
    "Dehradun", "Allahabad", "Gorakhpur", "Guwahati", "Bhubaneswar",
    "Coimbatore", "Kochi", "Visakhapatnam", "Vijayawada", "Madurai",
    "Nashik", "Aurangabad", "Solapur", "Jodhpur", "Udaipur",
  ],

  // ---------- STATE NAMES (for display) ----------
  stateNames: {
    "MH": "Maharashtra",
    "DL": "Delhi",
    "KA": "Karnataka",
    "TN": "Tamil Nadu",
    "WB": "West Bengal",
    "TS": "Telangana",
    "GJ": "Gujarat",
    "RJ": "Rajasthan",
    "UP": "Uttar Pradesh",
    "MP": "Madhya Pradesh",
    "PB": "Punjab",
    "HR": "Haryana",
    "BR": "Bihar",
    "JH": "Jharkhand",
    "UK": "Uttarakhand",
    "AS": "Assam",
    "OR": "Odisha",
    "KL": "Kerala",
    "AP": "Andhra Pradesh",
    "CH": "Chandigarh",
  },

};

// Make available globally
window.CONTENT = CONTENT;
