import { RULES, SAFE_WORDS, type Kind, type Rule } from "./rules";

export type Finding = {
  rule: Rule;
  /** "exact": the label spells the ingredient. "possible": one or two letters off, likely a misread photo. */
  match: "exact" | "possible";
  /** The words on the label that matched, as printed. */
  found: string;
  /** Strength printed next to it, e.g. "0.05% w/w". */
  strength?: string;
};

export type Verdict =
  | "steroid" // a steroid medicine
  | "mercury" // a mercury compound
  | "medicine" // another prescription-type medicine (hydroquinone, retinoid, antibiotic, antifungal)
  | "possible" // only near-matches: check the label by eye
  | "none" // readable, nothing on our list. Never "safe".
  | "unreadable"; // too little text to judge

export type CheckResult = {
  verdict: Verdict;
  findings: Finding[];
  /** A steroid mixed with an antibiotic or antifungal in one cream. */
  combination: boolean;
  /** Ingredient-like words read from the label; shown so the user can see what was checked. */
  wordsRead: number;
};

const SALTS = "(?:propionate|dipropionate|valerate|furoate|acetonide|butyrate|acetate|aceponate|sodium phosphate|sulphate|sulfate|nitrate|hydrochloride|calcium|sodium)";
const STRENGTH = new RegExp(`^\\s*(?:${SALTS}\\s*)?(?:(?:ip|bp|usp)\\s*)?(\\d+(?:\\.\\d+)?\\s*%\\s*(?:w\\s*/\\s*[wv])?)`, "i");

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

const ALLOWED_TYPOS = (len: number) => (len >= 10 ? 2 : len >= 7 ? 1 : 0);

/** Common photo misreads: 1→l, 0→o, rn→m, vv→w. Applied before fuzzy matching only. */
const unOcr = (w: string) => w.replace(/1/g, "l").replace(/0/g, "o").replace(/rn/g, "m").replace(/vv/g, "w");

export function checkLabel(raw: string): CheckResult {
  const text = raw.normalize("NFKC");
  const lower = text.toLowerCase();
  const words = [...lower.matchAll(/[a-z0-9]+/g)].map((m) => ({ w: m[0], at: m.index }));
  const wordsRead = words.filter((x) => /[a-z]{3,}/.test(x.w)).length;

  const findings: Finding[] = [];
  const add = (rule: Rule, match: Finding["match"], w: string, at: number) => {
    const prior = findings.findIndex((f) => f.rule.id === rule.id);
    if (prior >= 0 && (findings[prior].match === "exact" || match === "possible")) return;
    const tail = text.slice(at + w.length, at + w.length + 48);
    const strength = STRENGTH.exec(tail)?.[1]?.replace(/\s+/g, " ").trim();
    const finding: Finding = { rule, match, found: text.slice(at, at + w.length), strength };
    if (prior >= 0) findings[prior] = finding;
    else findings.push(finding);
  };
  for (const { w, at } of words) {
    if (w.length < 5 || SAFE_WORDS.has(w)) continue;
    const exact = RULES.find((r) => r.spellings.includes(w));
    if (exact) {
      add(exact, "exact", w, at);
      continue; // "betamethasone" is not a misread "dexamethasone"
    }
    // Near-match: the closest ingredient only, within the typo allowance for its length.
    let best: { rule: Rule; d: number } | null = null;
    const fixed = unOcr(w);
    for (const rule of RULES) {
      for (const s of rule.spellings) {
        const max = ALLOWED_TYPOS(s.length);
        if (max === 0) continue;
        const d = editDistance(fixed, s, max);
        if (d <= max && (!best || d < best.d)) best = { rule, d };
      }
    }
    if (best) add(best.rule, "possible", w, at);
  }
  // An exact match always wins over a near-match of the same ingredient found earlier.
  const exactKinds = new Set(findings.filter((f) => f.match === "exact").map((f) => f.rule.kind));
  const has = (k: Kind) => exactKinds.has(k);
  const combination = has("steroid") && (has("antibiotic") || has("antifungal"));

  let verdict: Verdict;
  if (has("steroid")) verdict = "steroid";
  else if (has("mercury")) verdict = "mercury";
  else if (exactKinds.size > 0) verdict = "medicine";
  else if (findings.length > 0) verdict = "possible";
  else verdict = wordsRead >= 3 ? "none" : "unreadable";

  const order: Kind[] = ["steroid", "mercury", "hydroquinone", "retinoid", "antibiotic", "antifungal"];
  findings.sort((a, b) => (a.match === b.match ? 0 : a.match === "exact" ? -1 : 1) || order.indexOf(a.rule.kind) - order.indexOf(b.rule.kind));
  return { verdict, findings, combination, wordsRead };
}
