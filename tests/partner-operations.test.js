import test from "node:test";
import assert from "node:assert/strict";
import { handleOperations } from "../worker.js";

function partnerDb() {
  const partners = new Map();
  const suppressions = new Map();
  const actions = new Map();
  return {
    partners,
    suppressions,
    actions,
    prepare(sql) {
      let values = [];
      return {
        sql,
        get values() { return values; },
        bind(...args) { values = args; return this; },
        async first() {
          if (sql.includes("FROM agent_actions WHERE idempotency_key")) return actions.get(values[0]) || null;
          if (sql.includes("FROM suppression_list WHERE phone")) return suppressions.get(values[0]) || null;
          return null;
        },
        async all() {
          if (sql.includes("FROM partners")) return { results: Array.from(partners.values()) };
          if (sql.includes("FROM suppression_list")) return { results: Array.from(suppressions.values()) };
          return { results: [] };
        },
      };
    },
    async batch(statements) {
      const [record, audit] = statements;
      if (record.sql.includes("INSERT INTO partners")) {
        const [id, partner_code, name, organisation, contact_name, category, phone, email, created_by, created_ms, updated_ms] = record.values;
        partners.set(id, { id, partner_code, name, organisation, contact_name, category, phone, email, status: "prospect", referral_fee_eligible: 0, created_by, created_ms, updated_ms });
      } else if (record.sql.includes("INSERT OR IGNORE INTO suppression_list")) {
        const [id, phone, reason, source, created_by, created_ms] = record.values;
        if (!suppressions.has(phone)) suppressions.set(phone, { id, phone, reason, source, created_by, created_ms });
      }
      const [id, actor, action, target_type, target_id, idempotency_key, result, created_ms] = audit.values;
      actions.set(idempotency_key, { id, actor, action, target_type, target_id, result, created_ms });
    },
  };
}

function request(path, { method = "GET", body, key } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (key) headers["Idempotency-Key"] = key;
  return new Request("https://alliancegroups.com.au/api/internal/" + path, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

const owner = { email: "owner@example.test" };

test("partner records are created as unapproved prospects with fees disabled", async () => {
  const db = partnerDb();
  const response = await handleOperations(request("partners", {
    method: "POST",
    key: "partner-create-0001",
    body: { name: "Example Strata", category: "strata", phone: "0403 123 456" },
  }), { CRM_DB: db }, owner);
  const result = await response.json();
  assert.equal(response.status, 201);
  assert.equal(result.status, "prospect");
  assert.equal(result.referralFeeEligible, false);
  assert.equal(db.partners.get(result.id).status, "prospect");
  assert.equal(db.partners.get(result.id).referral_fee_eligible, 0);
  assert.equal(db.actions.size, 1);
});

test("assessors cannot be assigned referral fees and requests are idempotent", async () => {
  const db = partnerDb();
  const payload = { name: "Example Assessor", category: "assessor", email: "assessor@example.test" };
  const first = await handleOperations(request("partners", { method: "POST", key: "partner-create-0002", body: payload }), { CRM_DB: db }, owner);
  const id = (await first.json()).id;
  const replay = await handleOperations(request("partners", { method: "POST", key: "partner-create-0002", body: payload }), { CRM_DB: db }, owner);
  assert.equal(replay.status, 200);
  assert.equal((await replay.json()).duplicate, true);
  assert.equal(db.partners.size, 1);
  assert.equal(db.partners.get(id).referral_fee_eligible, 0);
});

test("partner creation rejects invalid contact data and cross-operation idempotency reuse", async () => {
  const db = partnerDb();
  for (const [key, body] of [
    ["partner-create-0003", { name: "No Contact", category: "builder" }],
    ["partner-create-0004", { name: "Invalid Phone", category: "builder", phone: "        " }],
    ["partner-create-0005", { name: "Invalid Contact", category: "builder", contact_name: [], phone: "0403123456" }],
  ]) {
    const invalid = await handleOperations(request("partners", {
      method: "POST",
      key,
      body,
    }), { CRM_DB: db }, owner);
    assert.equal(invalid.status, 400);
  }
  const created = await handleOperations(request("partners", {
    method: "POST",
    key: "shared-key-00001",
    body: { name: "Example Builder", category: "builder", phone: "0403123456" },
  }), { CRM_DB: db }, owner);
  assert.equal(created.status, 201);
  const conflict = await handleOperations(request("suppressions", {
    method: "POST",
    key: "shared-key-00001",
    body: { phone: "0403123456", reason: "stop_request" },
  }), { CRM_DB: db }, owner);
  assert.equal(conflict.status, 409);
  assert.equal(db.suppressions.size, 0);
});

test("suppression normalises Australian numbers and permanently blocks the contact", async () => {
  const db = partnerDb();
  const response = await handleOperations(request("suppressions", {
    method: "POST",
    key: "suppression-add-0001",
    body: { phone: "0403 123 456", reason: "not_interested", source: "owner_review" },
  }), { CRM_DB: db }, owner);
  const result = await response.json();
  assert.equal(response.status, 201);
  assert.equal(result.suppressed, true);
  assert.equal(result.outboundBlocked, true);
  assert.equal(db.suppressions.get("+61403123456").reason, "not_interested");
  assert.equal(db.actions.get("suppression-add-0001").action, "contact_suppressed");
});

test("invalid suppression requests are rejected and no call initiation endpoint exists", async () => {
  const db = partnerDb();
  const invalid = await handleOperations(request("suppressions", {
    method: "POST",
    key: "suppression-add-0002",
    body: { phone: "not a phone", reason: "stop_request" },
  }), { CRM_DB: db }, owner);
  assert.equal(invalid.status, 400);
  const outbound = await handleOperations(request("call-attempts", {
    method: "POST",
    key: "call-attempt-00001",
    body: { phone: "0403123456" },
  }), { CRM_DB: db }, owner);
  assert.equal(outbound.status, 404);
  assert.equal(db.suppressions.size, 0);
});
