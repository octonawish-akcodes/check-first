import { describe, expect, it } from "vitest";
import { makePlan, GOALS, WARNING_SIGNS } from "@/lib/care/plan";
import { checkLabel } from "@/lib/check/check";
import { demoReading } from "@/lib/skin/demo";
import { normalizeSkin } from "@/lib/skin/normalize";

describe("normalizeSkin", () => {
  it("reads the recorded live result: 8 concerns, lowest raw score first, ui kept separately", () => {
    const r = demoReading();
    expect(r.scores).toHaveLength(8);
    expect(r.scores[0].concern).toBe("moisture");
    expect(r.scores.every((s, i, a) => i === 0 || a[i - 1].raw <= s.raw)).toBe(true);
    expect(r.skinType).toBe("Normal");
    expect(r.source).toBe("demo");
  });

  it("ignores junk instead of crashing", () => {
    expect(normalizeSkin([null, 3, { type: "acne" }, { type: "pore", raw_score: "x", ui_score: 1 }], "live").scores).toEqual([]);
  });
});

describe("makePlan", () => {
  it("the advice never recommends a medicine: every step passes the label checker", () => {
    for (const goal of GOALS) {
      for (const s of makePlan({ goal, reading: demoReading(), usingFlagged: true, signs: [...WARNING_SIGNS] }).steps) {
        const text = [s.title.en, s.why.en, s.lookFor.join(", "), s.search].join(" ");
        expect(checkLabel(text).findings, `${goal}/${s.id}`).toEqual([]);
      }
    }
  });

  it("always includes sunscreen, and starts with what the person asked for", () => {
    for (const goal of GOALS) expect(makePlan({ goal, usingFlagged: false, signs: [] }).steps.some((s) => s.id === "sunscreen")).toBe(true);
    expect(makePlan({ goal: "acne", reading: demoReading(), usingFlagged: false, signs: [] }).focus[0]).toBe("acne");
  });

  it("is honest about 'fairer'", () => {
    expect(makePlan({ goal: "fairer", usingFlagged: false, signs: [] }).note?.en).toMatch(/No safe cream changes the colour/);
  });

  it("sends people to a doctor for warning signs, and never says to stop suddenly", () => {
    expect(makePlan({ goal: "spots", usingFlagged: false, signs: [] }).doctor).toEqual([]);
    const p = makePlan({ goal: "spots", usingFlagged: true, signs: ["worse_when_stopped"] });
    expect(p.doctor).toHaveLength(2);
    expect(p.doctor.map((d) => d.en).join(" ")).toMatch(/Don't stop suddenly/);
    expect(makePlan({ goal: "rash", usingFlagged: false, signs: [] }).doctor[0].en).toMatch(/infection/);
  });
});
