#!/usr/bin/env node
/**
 * One-time setup: creates the Compliance Shield PayPal Product and its
 * 6 Billing Plans (3 tiers x 2 intervals), then prints the Plan IDs to
 * paste into COMPLIANCE_SHIELD_PLAN_IDS in firebase-backend/functions/index.js.
 *
 * Run once against sandbox credentials to test, then again against live
 * credentials when going live (PayPal sandbox and live are separate catalogs).
 *
 * Usage:
 *   PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=... PAYPAL_ENV=sandbox node setup-paypal-plans.js
 */

const PAYPAL_ENV = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
const API_BASE = PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables first.");
  process.exit(1);
}

// Must match the ex-GST prices confirmed for COMPLIANCE_SHIELD_PLANS in index.js.
const PLANS = [
  { tier: "silver", label: "Silver", month: "39.50", year: "395.00" },
  { tier: "gold", label: "Gold", month: "79.50", year: "795.00" },
  { tier: "platinum", label: "Platinum", month: "149.50", year: "1495.00" },
];

async function getAccessToken() {
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OAuth token request failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function createProduct(token) {
  const res = await fetch(`${API_BASE}/v1/catalogs/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Compliance Shield",
      description: "Alliance Building & Hazmat Group Compliance Shield subscription",
      type: "SERVICE",
      category: "LEGAL_SERVICES",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Product creation failed: ${JSON.stringify(data)}`);
  return data.id;
}

async function createPlan(token, productId, label, intervalUnit, price) {
  const res = await fetch(`${API_BASE}/v1/billing/plans`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      name: `Compliance Shield — ${label} (${intervalUnit === "YEAR" ? "Annual" : "Monthly"})`,
      billing_cycles: [{
        frequency: { interval_unit: intervalUnit, interval_count: 1 },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // 0 = infinite, auto-renews until cancelled
        pricing_scheme: { fixed_price: { value: price, currency_code: "AUD" } },
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Plan creation failed (${label}/${intervalUnit}): ${JSON.stringify(data)}`);
  return data.id;
}

(async () => {
  console.log(`Creating Compliance Shield product + plans in PayPal ${PAYPAL_ENV.toUpperCase()}...`);
  const token = await getAccessToken();
  const productId = await createProduct(token);
  console.log(`Product created: ${productId}`);

  const result = {};
  for (const p of PLANS) {
    const monthId = await createPlan(token, productId, p.label, "MONTH", p.month);
    const yearId = await createPlan(token, productId, p.label, "YEAR", p.year);
    result[p.tier] = { month: monthId, year: yearId };
    console.log(`${p.label}: month=${monthId} year=${yearId}`);
  }

  console.log("\nPaste this into COMPLIANCE_SHIELD_PLAN_IDS in firebase-backend/functions/index.js:\n");
  console.log(JSON.stringify(result, null, 2));
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
