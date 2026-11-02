// Free check: is the key valid, and how many units are left? Never prints the key.
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8")
  .split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
const key = env.YOUCAM_API_KEY;
if (!key) { console.error("YOUCAM_API_KEY is empty in .env.local"); process.exit(1); }
const r = await fetch("https://yce-api-01.makeupar.com/s2s/v1.0/client/credit", { headers: { Authorization: `Bearer ${key}` } });
const j = await r.json().catch(() => ({}));
if (!r.ok) { console.error("HTTP", r.status, j?.error ?? j?.data?.error ?? ""); process.exit(1); }
const pots = j.results ?? j.data?.results ?? [];
console.log("Key OK. Units:", pots.reduce((s, p) => s + (p.amount ?? 0), 0), pots.map((p) => `${p.amount} (expires ${new Date(p.expiry).toISOString().slice(0, 10)})`).join(", "));
