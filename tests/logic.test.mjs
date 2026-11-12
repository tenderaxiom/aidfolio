// Checks the calculator's number reading, the CSV export and the clean-up of opened progress files.
// Run: node --test tests/logic.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const grab = (name) => { const i = html.indexOf("function " + name + "("); assert.ok(i > -1, name);
  let d = 0, j = html.indexOf("{", i); for (;; j++) { if (html[j] === "{") d++; else if (html[j] === "}" && --d === 0) break; }
  return html.slice(i, j + 1); };
const ctx = vm.createContext({ state: null, TODAY: new Date(2026, 10, 13) });
vm.runInContext(["num", "csvCell", "esc", "chip", "blank", "blankCost", "blankRisk", "normalise", "parseYM", "monthsSince", "itemStatus"].map(grab).join("\n") +
  '\nvar STATUS_LABEL={ready:"Ready",stale:"Needs update",undated:"Add a date",missing:"Missing",na:"Doesn\'t apply",unanswered:"Not answered"};', ctx);
const run = (code) => vm.runInContext(code, ctx);

test("numbers in every common style", () => {
  const cases = { "1,234.56": 1234.56, "1.234,56": 1234.56, "1 234,56": 1234.56, "1'234": 1234, "7,5": 7.5, "7.5": 7.5,
    "600.000": 600000, "600,000": 600000, "1.234.567": 1234567, "12,34,567.50": 1234567.5, "0.125": 0.125, "0,125": 0.125,
    ".5": 0.5, "42000": 42000, "": 0, "abc": 0, "-5": 0, "1e5": 0, "1.2.3,4,5": 0 };
  for (const [k, v] of Object.entries(cases)) assert.equal(run(`num(${JSON.stringify(k)})`), v, k);
});
test("percentages never treat one separator as thousands", () => {
  assert.equal(run('num("7.125", true)'), 7.125);
  assert.equal(run('num("12,375", true)'), 12.375);
  assert.equal(run('num("7%", true)'), 7);
});
test("CSV cells cannot start a formula", () => {
  assert.equal(run('csvCell("=1+1")'), '"\'=1+1"');
  assert.equal(run('csvCell("@SUM(A1)")'), '"\'@SUM(A1)"');
  assert.equal(run('csvCell("-1+cmd")'), '"\'-1+cmd"');
  assert.equal(run('csvCell("-12.5")'), '"-12.5"');
  assert.equal(run('csvCell("say \\"hi\\"")'), '"say ""hi"""');
});
test("a crafted progress file is cleaned", () => {
  run(`state=Object.assign(blank(), {answers:{a:"b",x:{}}, evidence:{e1:{s:'"><img src=x onerror=alert(1)>',d:'"><script>'}, e2:"x", e3:{s:"have",d:"2026-03"}, e4:{s:"have",d:"03/2026"}},
    plan:[1], skipped:"x", cost:{direct:"x",grants:[1,{name:"g"}]}, riskplan:{items:"x"}}); normalise();`);
  run(`var keep=Object.assign(blank(), {riskplan:{partner:"P",project:"",review:"",items:{fid:{L:2,I:3}}}}); var saved=state; state=keep; normalise(); keep=state; state=saved;`);
  assert.deepEqual(JSON.parse(run("JSON.stringify(keep.riskplan.items)")), { fid: { L: 2, I: 3 } });
  const st = JSON.parse(run("JSON.stringify(state)"));
  assert.deepEqual(st.evidence, { e1: { s: "", d: "" }, e3: { s: "have", d: "2026-03" }, e4: { s: "have", d: "03/2026" } });
  assert.deepEqual(st.answers, { a: "b" });
  assert.deepEqual(st.plan, {}); assert.deepEqual(st.skipped, {});
  assert.deepEqual(st.cost.direct, []); assert.deepEqual(st.cost.grants, [{ name: "g" }]);
  assert.deepEqual(st.riskplan.items, {});
});
test("chips only show known statuses", () => {
  assert.equal(run('chip("<b>")'), '<span class="chip unanswered">Not answered</span>');
  assert.equal(run('chip("ready")'), '<span class="chip ready">Ready</span>');
});
test("a future date does not count as current", () => {
  run('state=blank(); state.evidence={d1:{s:"have",d:"2027-06"}, d2:{s:"have",d:"2026-09"}};');
  assert.equal(run('itemStatus({id:"d1",valid:12})'), "undated");
  assert.equal(run('itemStatus({id:"d2",valid:12})'), "ready");
});
