// ============================================================
//  AAJKATEL.IN  --  api/report-price.js
//  Netlify Function: receives user price reports
//
//  Reports are emailed via Formspree or saved to a
//  Netlify Blobs store (both work on free plan).
//
//  Set env vars in Netlify dashboard:
//    FORMSPREE_ID  - your Formspree form ID (e.g. xyzabcde)
//                    or leave unset to just log to function logs
// ============================================================

const https = require("https");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const {
    city,
    fuelType,
    correctPrice,
    pumpName,
    reportedAt,
    currentPrice,
  } = body;

  // Basic validation
  if (!fuelType || !correctPrice) {
    return { statusCode: 400, body: "Missing required fields" };
  }

  const report = {
    city: city || "Unknown",
    fuelType,
    correctPrice: parseFloat(correctPrice),
    currentPriceOnSite: currentPrice,
    pumpName: pumpName || "Not specified",
    reportedAt: reportedAt || new Date().toISOString(),
    ip: event.headers["x-forwarded-for"] || "unknown",
  };

  // Always log to function logs (visible in Netlify dashboard)
  console.log("PRICE_REPORT:", JSON.stringify(report));

  // Forward to Formspree if key is set (free, receives email)
  const formspreeId = process.env.FORMSPREE_ID;
  if (formspreeId) {
    try {
      await postToFormspree(formspreeId, report);
    } catch (e) {
      console.error("Formspree error:", e.message);
      // Don't fail the user request over this
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true }),
  };
};

function postToFormspree(formId, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      city: data.city,
      fuel_type: data.fuelType,
      correct_price: `₹${data.correctPrice}/L`,
      current_price_on_site: data.currentPriceOnSite
        ? `₹${data.currentPriceOnSite}/L`
        : "N/A",
      pump_name: data.pumpName,
      reported_at: data.reportedAt,
    });

    const options = {
      hostname: "formspree.io",
      path: `/f/${formId}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        Accept: "application/json",
      },
    };

    const req = https.request(options, (res) => {
      res.on("data", () => {});
      res.on("end", resolve);
    });

    req.on("error", reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error("Formspree timeout")); });
    req.write(payload);
    req.end();
  });
}
