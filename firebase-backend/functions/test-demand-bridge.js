const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const {
  buildDemandPayload,
  signDemandWebhook,
  forwardLeadToDemandEngine,
} = require("./demand-bridge");

async function run() {
  const payload = buildDemandPayload("firebaseLead123", {
    name: "Jane Manager",
    company: "Example Strata",
    email: "jane@example.com",
    phone: "0400000000",
    service: "Asbestos / hazardous materials",
    siteAddress: "18 Sample Rd, Aspley QLD 4034",
    urgency: "Urgent / active issue",
    message: "Suspected asbestos material has been damaged during works.",
    isComplianceShield: false,
  });
  assert.equal(payload.client_name, "Example Strata");
  assert.equal(payload.contact_name, "Jane Manager");
  assert.equal(payload.service_type, "asbestos_removal");
  assert.equal(payload.site_address, "18 Sample Rd, Aspley QLD 4034");
  assert.equal(payload.idempotency_key, "firebase:firebaseLead123");
  assert.equal(payload.data_origin, "VERIFIED");

  const timestamp = "1760000000.5";
  const body = JSON.stringify(payload);
  const secret = "known-secret";
  const expected = crypto.createHmac("sha256", secret).update(timestamp + "." + body).digest("hex");
  assert.equal(signDemandWebhook(body, timestamp, secret), "sha256=" + expected);

  let fetchCalls = 0;
  const disabled = await forwardLeadToDemandEngine(payload, {
    url: "",
    secret,
    fetchImpl: async () => {
      fetchCalls += 1;
      throw new Error("must not call");
    },
  });
  assert.equal(disabled.status, "disabled");
  assert.equal(fetchCalls, 0);

  let captured;
  const delivered = await forwardLeadToDemandEngine(payload, {
    url: "https://internal.example/api/inbound/webhook",
    secret,
    timestamp: "1760000001",
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return {
        ok: true,
        status: 201,
        json: async () => ({ ref: "AG-L-2001", is_duplicate: false }),
      };
    },
  });
  assert.equal(delivered.status, "delivered");
  assert.equal(delivered.httpStatus, 201);
  assert.equal(captured.options.headers["X-Idempotency-Key"], "firebase:firebaseLead123");
  assert.equal(captured.options.headers["X-Alliance-Timestamp"], "1760000001");
  assert.match(captured.options.headers["X-Alliance-Signature"], /^sha256=[0-9a-f]{64}$/);
  assert.deepEqual(JSON.parse(captured.options.body), payload);

  const failed = await forwardLeadToDemandEngine(payload, {
    url: "https://internal.example/api/inbound/webhook",
    secret,
    fetchImpl: async () => {
      throw new Error("JARVIS offline");
    },
  });
  assert.equal(failed.status, "failed");
  assert.match(failed.error, /JARVIS offline/);

  const indexSource = require("node:fs").readFileSync(require("node:path").join(__dirname, "index.js"), "utf8");
  assert.match(indexSource, /forwardLeadToDemandEngine/);
  assert.match(indexSource, /demand_bridge_status/);
  assert.match(indexSource, /DEMAND_WEBHOOK_SECRET/);

  console.log("PASS: Firebase demand bridge maps, signs, deduplicates and fails open");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
