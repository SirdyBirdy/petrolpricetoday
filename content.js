// ============================================================
//  AAJKATEL.IN  --  content.js
//  Yahan sab copy hai. Prices yahan nahi, wo app.js ka kaam hai.
//  Edit karo freely, no cap.
// ============================================================

const CONTENT = {

  // ---------- HEADER ----------
  siteTitle: "AAJ KA TEL BHAV",
  siteTagline: "no filter, no drama, bas sahi price — fr fr",
  headerBadge: "⛽ LIVE",

  // ---------- LOCATION ----------
  locationDetecting: "tera shehar locate ho raha hai bestie...",
  locationGranted: (city, state) => `${city}, ${state}`,
  locationDenied: "location nahi mila re bhai, slay karo par location to do",
  locationError: "GPS ne ghosted kar diya",
  locationBtnDefault: "Mera Shehar Batao",
  locationBtnDetecting: "dhundh rahe hain no cap...",
  locationBtnRetry: "Phir Se Try Kar",

  // ---------- SEARCH ----------
  searchPlaceholder: "apna shehar type karo, we got you...",
  searchBtn: "Khojo",

  // ---------- LOADING STATES ----------
  loadingMessages: [
    "pump se bhav maang rahe hain, ek sec...",
    "IOCL ka server thoda sus lag raha hai...",
    "bhaiya ne abhi abhi rate board dekha, data aa raha hai...",
    "bas ek second, yeh era almost unlock ho gayi...",
    "government data fetch ho raha hai, izzat se wait karo...",
    "petrol wale bhaiya se no-reply aa raha tha, escalate kiya...",
  ],

  // ---------- ERROR STATES ----------
  errors: {
    locationDenied: "arre bhai location to allow karo! kahan ka bhav batayein, pata hi nahi toh price kaise milega. it's giving gatekeeping.",
    locationUnavailable: "location service band hai kya? settings mein jao aur on karo, yeh behavior mid hai.",
    cityNotFound: (city) => `"${city}" nahi mila bhai. sahi naam likho na, it's not that deep. Patna likho Patna, Lucknow likho Lucknow.`,
    fetchFailed: "net thoda slow hai ya server ne read receipts on karke reply nahi kiya. ek minute mein phir try karo.",
    generic: "kuch gadbad ho gayi, no worries. refresh karo bhai, main character energy rakho.",
  },

  // ---------- PRICE LABELS ----------
  petrolLabel: "PETROL",
  dieselLabel: "DIESEL",
  perLitre: "per litre",

  // ---------- PRICE CHANGE ----------
  priceUp: (amount) => `+${amount} badhaa aaj, it's giving pain`,
  priceDown: (amount) => `-${amount} ghata aaj, lowkey slay`,
  priceNoChange: "aaj koi change nahi, stable era",
  priceChangeUnknown: "",

  // ---------- LAST UPDATED ----------
  updatedText: (timeStr) => `last updated ${timeStr} pe, fresh data no cap`,
  updatedJustNow: "abhi abhi update hua, literally just now",

  // ---------- REPORT SECTION ----------
  reportToggleOpen: "galat bhav lag raha hai? that's sus, batao 🚩",
  reportToggleClose: "okay okay band karo yeh",
  reportDesc: "agar tumhare pump pe alag price dikh raha hai toh yahan batao. hum log dekh lenge, pinky promise.",
  reportThanks: "shukriya bestie! report mil gayi. jaldi sahi kar denge, fr.",
  reportSubmit: "Bhej Do Report",
  reportSubmitting: "bhej rahe hain...",
  reportFuelType: "Kaun sa tel?",
  reportCorrectPrice: "sahi bhav (per litre)",
  reportPumpName: "pump ka naam (optional hai)",
  reportPumpPlaceholder: "e.g. HP Petrol Pump, MG Road",
  reportPricePlaceholder: "e.g. 94.72",
  reportError: "bhai kuch to bharo pehle, empty submit it's giving nothing",

  // ---------- FUN FACTS (rotates daily) ----------
  funFacts: [
    "India mein petrol pe 100 rupaye ka tax hai aur 50 rupaye ka actual petrol. government literally said 'pay up bestie' and we said okay.",
    "sabse mehenga petrol Rajasthan mein milta hai. wahan jaoge toh cycle pe jaana, no fr.",
    "diesel pe truck wale zinda hain, truck wale zinda hain toh sabzi bazar zinda hai. so basically diesel ne India chalaya hua hai. diesel is the main character.",
    "2008 mein petrol 45 rupaye tha. uske baad se sirf rishte aur petrol dono mehenga hue. both equally painful.",
    "CNG wale log yahan aake sirf haath hila ke jaate hain. unka kuch nahi bigdega. they are thriving, no cap.",
    "petrol pump pe full tank karwana ek emotional investment hai. paise gaye, dil bhi gaya. it's giving trauma.",
    "ek litre petrol se kareeb 12-15 km chalti hai gaadi. ek litre chai se 0 km. choose your era wisely.",
    "OPEC ne ek baar price badhaaya, India ke 140 crore logo ne ek saath andar ki saans li. biggest collective slay fail of our time.",
    "electric car walo ke paas yeh app download karne ki koi zaroorat nahi. par phir bhi aaye hain, to swagat hai bestie.",
    "petrol pump pe zyada rona mat, pump wala bhi usi ki daali pe baitha hai. we are all in this together fr.",
    "price dekhke shock lag raha hai? cycle kharido bhai. environment bhi bachega, wallet bhi. glow up era.",
    "agar petrol ki jagah chai bechte toh India ka current account deficit nahi hota. chai supremacy, always has been.",
    "har subah 6 baje petrol ka naya price announce hota hai. India wakes up and chooses violence daily.",
    "petrol price aur exam result dono ek hi cheez hai: dekho, dil dukha, aage badho. it's giving resilience.",
    "jo log 'petrol sasta tha' wali nostalgia mein hain, unhe bata do: woh era over hai bestie. let it go.",
  ],

  // ---------- FOOTER ----------
  footerDisclaimer: "yeh prices informational hain, no cap. exact bhav pump pe jake confirm karo. hum responsible nahi hain agar price alag nikla, literally not our fault.",
  footerCredit: "banaya pyaar se. data: PPAC / IOC / crowd reports.",
  footerSourceLink: "Data Source",

  // ---------- SHARE ----------
  shareTitle: (city) => `${city} mein aaj ka petrol bhav dekho, it's giving expensive`,
  shareText: (city, petrol, diesel) =>
    `${city} mein aaj petrol ₹${petrol}/L aur diesel ₹${diesel}/L chal raha hai. yaar we need a raise fr. aajkatel.in pe check karo!`,

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
