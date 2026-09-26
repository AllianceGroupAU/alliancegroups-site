import test from "node:test";
import assert from "node:assert/strict";
import { handleIntake } from "../worker.js";

function request(body) {
  return new Request("https://alliancegroups.com.au/api/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const baseLead = {
  name: "Test Client",
  email: "client@example.com",
  phone: "0400000000",
  service: "Roofing",
  message: "Roof leak over living area.",
};

test("delivers notification and archives the lead", async () => {
  let mail;
  const env = { EMAIL: { send: async (message) => { mail = message; return { delivered: ["la.asbestos@gmail.com"] }; } } };
  const fakeFetch = async () => Response.json({ captured: true }, { status: 202 });
  const response = await handleIntake(request(baseLead), env, fakeFetch);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.notificationDelivered, true);
  assert.equal(payload.archived, true);
  assert.equal(mail.to, "la.asbestos@gmail.com");
  assert.equal(mail.from, "website@alliancegroups.com.au");
  assert.equal(mail.replyTo, "client@example.com");
});

test("normalises service-order forms before archiving", async () => {
  let archived;
  const env = { EMAIL: { send: async () => ({ delivered: ["la.asbestos@gmail.com"] }) } };
  const fakeFetch = async (_url, options) => {
    archived = JSON.parse(options.body);
    return Response.json({ captured: true }, { status: 202 });
  };
  const response = await handleIntake(request({
    name: "Order Client",
    email: "order@example.com",
    phone: "0411111111",
    product: "Residential On-Site Testing - $195",
    notes: "Bathroom wall sheeting.",
  }), env, fakeFetch);
  assert.equal(response.status, 200);
  assert.equal(archived.service, "Residential On-Site Testing - $195");
  assert.equal(archived.message, "Bathroom wall sheeting.");
});

test("returns captured-only state when email delivery fails", async () => {
  const env = { EMAIL: { send: async () => { throw new Error("mail unavailable"); } } };
  const fakeFetch = async () => Response.json({ captured: true }, { status: 202 });
  const response = await handleIntake(request(baseLead), env, fakeFetch);
  const payload = await response.json();
  assert.equal(response.status, 202);
  assert.equal(payload.captured, true);
  assert.equal(payload.notificationDelivered, false);
});

test("does not claim success when both delivery paths fail", async () => {
  const env = { EMAIL: { send: async () => { throw new Error("mail unavailable"); } } };
  const fakeFetch = async () => { throw new Error("archive unavailable"); };
  const response = await handleIntake(request(baseLead), env, fakeFetch);
  assert.equal(response.status, 502);
});
