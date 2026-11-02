import { describe, expect, it } from "vitest";
import { checkLabel } from "@/lib/check/check";

const ids = (text: string) => checkLabel(text).findings.map((f) => `${f.rule.id}:${f.match}`);

describe("checkLabel: steroid creams as Indian labels print them", () => {
  it("flags a steroid + antibiotic + antifungal combination cream, with strengths", () => {
    const r = checkLabel("Each gram contains: Clobetasol Propionate IP 0.05% w/w, Neomycin Sulphate IP 0.5% w/w, Miconazole Nitrate IP 2% w/w, Cream base q.s.");
    expect(r.verdict).toBe("steroid");
    expect(r.combination).toBe(true);
    expect(r.findings[0]).toMatchObject({ match: "exact", found: "Clobetasol", strength: "0.05% w/w" });
    expect(ids("Clobetasol Propionate IP 0.05% w/w, Neomycin Sulphate IP 0.5% w/w, Miconazole Nitrate IP 2% w/w")).toEqual(["clobetasol:exact", "neomycin:exact", "miconazole:exact"]);
  });

  it("flags the triple-combination 'fairness' cream (hydroquinone + tretinoin + steroid)", () => {
    const r = checkLabel("Hydroquinone USP 2% w/w, Tretinoin USP 0.025% w/w, Mometasone Furoate IP 0.1% w/w in a cream base");
    expect(r.verdict).toBe("steroid");
    expect(r.combination).toBe(false);
    expect(r.findings.map((f) => f.rule.id)).toEqual(["mometasone", "hydroquinone", "tretinoin"]);
    expect(r.findings.find((f) => f.rule.id === "mometasone")?.strength).toBe("0.1% w/w");
  });

  it("knows which steroids were made prescription-only in March 2018", () => {
    const beta = checkLabel("Betamethasone Valerate IP 0.12% w/w").findings[0];
    expect(beta.rule.scheduleH2018).toBe(true);
    expect(beta.strength).toBe("0.12% w/w");
    expect(checkLabel("Clobetasol propionate 0.05%").findings[0].rule.scheduleH2018).toBeFalsy();
  });

  it("reads British spellings, upper case and line breaks", () => {
    expect(checkLabel("BECLOMETASONE DIPROPIONATE\nIP 0.025% W/W").verdict).toBe("steroid");
    expect(checkLabel("Fluocinolone\nAcetonide 0.01%").findings[0].strength).toBe("0.01%");
    expect(checkLabel("Halobetasol propionate 0.05%").verdict).toBe("steroid");
    expect(checkLabel("hydrocortisone acetate 1% w/w").verdict).toBe("steroid");
  });

  it("does not confuse two steroids that are a couple of letters apart", () => {
    expect(ids("Betamethasone dipropionate 0.05%")).toEqual(["betamethasone:exact"]);
    expect(ids("Clobetasone butyrate 0.05%")).toEqual(["clobetasone:exact"]);
  });
});

describe("checkLabel: photo misreads", () => {
  it("reports a misread steroid as a possible match, never as nothing", () => {
    for (const misread of ["Clobetaso1 Propionate 0.05%", "Betamethasorie Valerate", "Mometasome furoate 0.1%"]) {
      const r = checkLabel(misread);
      expect(r.verdict, misread).toBe("possible");
      expect(r.findings[0].rule.kind).toBe("steroid");
    }
  });

  it("an exact match of the same ingredient replaces an earlier near-match", () => {
    const r = checkLabel("Clobetaso1 ... Clobetasol Propionate IP 0.05% w/w");
    expect(r.verdict).toBe("steroid");
    expect(ids("Clobetaso1 ... Clobetasol Propionate IP 0.05% w/w")).toEqual(["clobetasol:exact"]);
  });
});

describe("checkLabel: no false alarms on ordinary cosmetics", () => {
  it("passes a normal moisturiser as 'none', never as safe", () => {
    const r = checkLabel("Aqua, Niacinamide, Glycerin, Cetearyl Alcohol, Dimethicone, Panthenol, Allantoin, Phenoxyethanol, Methylparaben, Fragrance");
    expect(r.verdict).toBe("none");
    expect(r.findings).toEqual([]);
  });

  it("does not mistake cosmetic retinoids and vitamins for medicines", () => {
    expect(checkLabel("Retinol 0.3%, Retinyl Palmitate, Dexpanthenol, Betaine, Tocopherol, Ascorbic acid").verdict).toBe("none");
    expect(checkLabel("Alpha Arbutin 2%, Kojic acid, Glycolic acid, Lactic acid, Salicylic acid 2%").verdict).toBe("none");
  });

  it("does not flag sunscreen filters or common emollients", () => {
    expect(checkLabel("Octocrylene, Avobenzone, Zinc Oxide, Titanium Dioxide, Ethylhexyl Methoxycinnamate, Bisoctrizole").verdict).toBe("none");
    expect(checkLabel("Petrolatum, Mineral Oil, Ceramide NP, Squalane, Shea butter, Hyaluronic acid").verdict).toBe("none");
  });
});

describe("checkLabel: other medicines and mercury", () => {
  it("flags hydroquinone or tretinoin alone as a medicine", () => {
    expect(checkLabel("Hydroquinone 4% w/w cream").verdict).toBe("medicine");
    expect(checkLabel("Adapalene gel 0.1% w/w").verdict).toBe("medicine");
  });

  it("flags mercury compounds", () => {
    expect(checkLabel("Contains mercurous chloride, aqua, paraffin").verdict).toBe("mercury");
    expect(checkLabel("Calomel, petrolatum, fragrance").verdict).toBe("mercury");
  });

  it("says it couldn't read rather than guessing", () => {
    expect(checkLabel("").verdict).toBe("unreadable");
    expect(checkLabel("50g cream").verdict).toBe("unreadable");
  });
});

import { highlight } from "@/lib/check/highlight";
describe("highlight", () => {
  it("circles every place a matched word was printed, and only whole words", () => {
    const text = "Clobetasol Propionate IP 0.05% w/w. Keep clobetasol away from eyes. Notclobetasol.";
    const segs = highlight(text, checkLabel(text).findings);
    expect(segs.filter((s) => s.mark === "hit").map((s) => s.text)).toEqual(["Clobetasol", "clobetasol"]);
    expect(segs.map((s) => s.text).join("")).toBe(text);
  });
});
