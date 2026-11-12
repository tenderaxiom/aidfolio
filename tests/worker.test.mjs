// Checks the Worker: the www redirect and mail forwarding. Run: node --test tests/worker.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const env = (extra = {}) => ({ ASSETS: { fetch: async () => new Response("asset") }, ...extra });
const mail = (fail = []) => { const m = { sent: [], rejected: null,
  forward: async (to) => { if (fail.includes(to)) throw new Error("unverified"); m.sent.push(to); },
  setReject: (r) => { m.rejected = r; } }; return m; };

test("www is redirected to the bare domain, keeping path and query", async () => {
  const r = await worker.fetch(new Request("https://www.aidfolio.org/guides/?a=1"), env());
  assert.equal(r.status, 301); assert.equal(r.headers.get("location"), "https://aidfolio.org/guides/?a=1");
});
test("the bare domain is served from the static files", async () => {
  const r = await worker.fetch(new Request("https://aidfolio.org/"), env());
  assert.equal(await r.text(), "asset");
});
test("mail goes to every inbox in FORWARD_TO", async () => {
  const m = mail(); await worker.email(m, env({ FORWARD_TO: "a@example.org, b@example.org" }));
  assert.deepEqual(m.sent, ["a@example.org", "b@example.org"]); assert.equal(m.rejected, null);
});
test("one failing inbox does not lose the message", async () => {
  const m = mail(["a@example.org"]); await worker.email(m, env({ FORWARD_TO: "a@example.org,b@example.org" }));
  assert.deepEqual(m.sent, ["b@example.org"]); assert.equal(m.rejected, null);
});
test("mail is turned away when FORWARD_TO is missing or every inbox fails", async () => {
  const m1 = mail(); await worker.email(m1, env()); assert.ok(m1.rejected);
  const m2 = mail(["a@example.org"]); await worker.email(m2, env({ FORWARD_TO: "a@example.org" })); assert.ok(m2.rejected);
});
