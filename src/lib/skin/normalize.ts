// YouCam's skin-analysis output, reduced to what the app uses. Pure: safe in the browser and in tests.

export const CONCERNS = ["age_spot", "acne", "redness", "texture", "oiliness", "moisture", "radiance", "pore"] as const;
export type Concern = (typeof CONCERNS)[number];

export type ConcernScore = {
  concern: Concern;
  /** YouCam's display score. Deliberately generous ("psychological motivator" in its docs): shown, never compared. */
  ui: number;
  /** The honest score, 0–100, higher is better. All maths uses this. */
  raw: number;
  mask?: string;
};

export type SkinReading = {
  scores: ConcernScore[];
  skinType?: string;
  overall?: number;
  /** "live" from YouCam just now, or "demo" (a recorded real YouCam result). */
  source: "live" | "demo";
  at: string;
};

const isConcern = (t: unknown): t is Concern => typeof t === "string" && (CONCERNS as readonly string[]).includes(t);

export function normalizeSkin(output: unknown[], source: SkinReading["source"], at = new Date().toISOString()): SkinReading {
  const scores: ConcernScore[] = [];
  let skinType: string | undefined;
  let overall: number | undefined;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const x = item as Record<string, unknown>;
    if (isConcern(x.type) && typeof x.raw_score === "number" && typeof x.ui_score === "number") {
      const mask = Array.isArray(x.mask_urls) && typeof x.mask_urls[0] === "string" ? x.mask_urls[0] : undefined;
      scores.push({ concern: x.type, ui: x.ui_score, raw: Math.round(x.raw_score * 10) / 10, mask });
    } else if (x.type === "skin_type" && x.region === "whole" && typeof x.skin_type === "string") {
      skinType = x.skin_type;
    } else if (x.type === "all" && typeof x.score === "number") {
      overall = x.score;
    }
  }
  scores.sort((a, b) => a.raw - b.raw);
  return { scores, skinType, overall, source, at };
}
