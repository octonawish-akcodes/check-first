// One live Skin Analysis (SD, v2.1) on a public image URL. Saves the raw response to fixtures/. Never prints the key.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8")
  .split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
const API = "https://yce-api-01.makeupar.com";
const H = { Authorization: `Bearer ${env.YOUCAM_API_KEY}`, "Content-Type": "application/json" };
const [src, out = "fixtures/skin-sample.json"] = process.argv.slice(2);
const actions = ["acne", "age_spot", "redness", "texture", "oiliness", "moisture", "radiance", "pore", "skin_type"];
const t0 = Date.now();
const c = await fetch(`${API}/s2s/v2.1/task/skin-analysis`, { method: "POST", headers: H,
  body: JSON.stringify({ src_file_url: src, dst_actions: actions, miniserver_args: { enable_mask_overlay: false }, format: "json" }) });
const cj = await c.json(); if (!c.ok) { console.error("create", c.status, JSON.stringify(cj)); process.exit(1); }
const id = cj.data.task_id;
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 2000));
  const g = await (await fetch(`${API}/s2s/v2.1/task/skin-analysis/${id}`, { headers: H })).json();
  const st = g.data?.task_status;
  if (st === "success" || st === "error") {
    mkdirSync(new URL("../fixtures/", import.meta.url), { recursive: true });
    writeFileSync(new URL(`../${out}`, import.meta.url), JSON.stringify(g, null, 2));
    console.log(st, `${((Date.now() - t0) / 1000).toFixed(1)}s`, "saved", out); process.exit(st === "success" ? 0 : 1);
  }
}
console.error("timeout");
