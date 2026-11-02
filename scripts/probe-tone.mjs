// One live Skin Tone Analysis, then a Makeup VTO foundation in that exact shade, on the sample face.
// Saves the tone result to src/lib/skin/demo-tone.json and the try-on image to public/demo/. Never prints the key.
import { readFileSync, writeFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8")
  .split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
const API = "https://yce-api-01.makeupar.com";
const H = { Authorization: `Bearer ${env.YOUCAM_API_KEY}`, "Content-Type": "application/json" };
const credit = async () => ((await (await fetch(`${API}/s2s/v1.0/client/credit`, { headers: H })).json()).results ?? []).reduce((s, p) => s + p.amount, 0);

async function upload(bytes) {
  const r = await (await fetch(`${API}/s2s/v2.0/file`, { method: "POST", headers: H,
    body: JSON.stringify({ files: [{ content_type: "image/jpeg", file_name: "face.jpg", file_size: bytes.length }] }) })).json();
  const f = r.data.files[0], t = f.requests[0];
  const put = await fetch(t.url, { method: t.method ?? "PUT", headers: Object.fromEntries(Object.entries(t.headers ?? {}).map(([k, v]) => [k, String(v)])), body: bytes });
  if (!put.ok) throw new Error(`put ${put.status}`);
  return f.file_id;
}

async function run(task, body) {
  const c = await fetch(`${API}/s2s/v2.0/task/${task}`, { method: "POST", headers: H, body: JSON.stringify(body) });
  const cj = await c.json(); if (!c.ok) throw new Error(`${task} create ${c.status} ${JSON.stringify(cj)}`);
  const id = cj.data.task_id;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const g = await (await fetch(`${API}/s2s/v2.0/task/${task}/${id}`, { headers: H })).json();
    const st = g.data?.task_status;
    if (st === "success") return g.data;
    if (st === "error" || st === "failed") throw new Error(`${task} ${JSON.stringify(g.data)}`);
  }
  throw new Error(`${task} timeout`);
}

const before = await credit();
const fileId = await upload(readFileSync(new URL("../public/demo/face.jpg", import.meta.url)));
const tone = await run("skin-tone-analysis", { src_file_id: fileId, face_angle_strictness_level: "flexible" });
console.log("tone results:", JSON.stringify(tone.results));
const skin = tone.results.color.skin_color;
const vto = await run("makeup-vto", { src_file_id: fileId, version: "1.0", effects: [
  { category: "skin_smooth", skinSmoothStrength: 0, skinSmoothColorIntensity: 0 },
  { category: "foundation", palettes: [{ color: skin, colorIntensity: 40, coverageIntensity: 60, glowIntensity: 20 }] },
] });
console.log("vto results keys:", JSON.stringify(vto.results).slice(0, 300));
const url = vto.results.url ?? vto.results[0]?.download_url ?? vto.results[0]?.url;
writeFileSync(new URL("../public/demo/vto-foundation.jpg", import.meta.url), Buffer.from(await (await fetch(url)).arrayBuffer()));
writeFileSync(new URL("../src/lib/skin/demo-tone.json", import.meta.url), JSON.stringify({ recorded: new Date().toISOString().slice(0, 10), color: tone.results.color, face_quality: tone.results.face_quality ?? null }, null, 1));
console.log("units used:", before - (await credit()));
