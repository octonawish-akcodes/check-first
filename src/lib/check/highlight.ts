import type { Finding } from "./check";

export type Segment = { text: string; mark?: "hit" | "maybe" };

/** Splits the label text so every matched word can be circled where it was printed. */
export function highlight(text: string, findings: Finding[]): Segment[] {
  const marks = findings.map((f) => ({ word: f.found.toLowerCase(), kind: f.match === "exact" ? ("hit" as const) : ("maybe" as const) }));
  if (marks.length === 0) return [{ text }];
  const escaped = marks.map((m) => m.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(?<![a-z0-9])(${escaped.join("|")})(?![a-z0-9])`, "gi");
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[0], mark: marks.find((x) => x.word === m[0].toLowerCase())?.kind ?? "hit" });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
