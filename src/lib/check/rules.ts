// What the label checker looks for. A fixed list, matched exactly: no AI decides what is safe.

export type Kind = "steroid" | "hydroquinone" | "retinoid" | "mercury" | "antibiotic" | "antifungal";

export type Rule = {
  id: string;
  /** Name as printed on Indian labels (INN spelling). */
  name: string;
  kind: Kind;
  /** Spellings that count as an exact match, lowercase, no punctuation. */
  spellings: string[];
  /** One of the 14 steroids moved to Schedule H (prescription only) on 23 March 2018. */
  scheduleH2018?: boolean;
};

const steroid = (id: string, name: string, spellings: string[], scheduleH2018 = false): Rule => ({ id, name, kind: "steroid", spellings, scheduleH2018 });

export const RULES: Rule[] = [
  // The 14 steroids in the March 2018 notification (Medical Dialogues' copy of the list).
  steroid("alclometasone", "Alclometasone", ["alclometasone"], true),
  steroid("beclomethasone", "Beclomethasone", ["beclomethasone", "beclometasone"], true),
  steroid("betamethasone", "Betamethasone", ["betamethasone"], true),
  steroid("desonide", "Desonide", ["desonide"], true),
  steroid("desoximetasone", "Desoximetasone", ["desoximetasone", "desoxymethasone"], true),
  steroid("dexamethasone", "Dexamethasone", ["dexamethasone"], true),
  steroid("diflorasone", "Diflorasone", ["diflorasone"], true),
  steroid("fluocinonide", "Fluocinonide", ["fluocinonide"], true),
  steroid("fluocinolone", "Fluocinolone", ["fluocinolone"], true),
  steroid("halobetasol", "Halobetasol", ["halobetasol", "ulobetasol"], true),
  steroid("halometasone", "Halometasone", ["halometasone"], true),
  steroid("methylprednisolone", "Methylprednisolone", ["methylprednisolone", "methylprednisone"], true),
  steroid("prednicarbate", "Prednicarbate", ["prednicarbate"], true),
  steroid("triamcinolone", "Triamcinolone", ["triamcinolone"], true),
  // Other topical steroids sold in India. Still medicines; the app makes no legal claim about them.
  steroid("clobetasol", "Clobetasol", ["clobetasol"]),
  steroid("clobetasone", "Clobetasone", ["clobetasone"]),
  steroid("mometasone", "Mometasone", ["mometasone"]),
  steroid("fluticasone", "Fluticasone", ["fluticasone"]),
  steroid("hydrocortisone", "Hydrocortisone", ["hydrocortisone"]),
  steroid("budesonide", "Budesonide", ["budesonide"]),
  steroid("flumethasone", "Flumethasone", ["flumethasone", "flumetasone"]),
  steroid("fluprednidene", "Fluprednidene", ["fluprednidene"]),
  steroid("prednisolone", "Prednisolone", ["prednisolone"]),
  { id: "hydroquinone", name: "Hydroquinone", kind: "hydroquinone", spellings: ["hydroquinone"] },
  { id: "tretinoin", name: "Tretinoin", kind: "retinoid", spellings: ["tretinoin"] },
  { id: "adapalene", name: "Adapalene", kind: "retinoid", spellings: ["adapalene"] },
  { id: "tazarotene", name: "Tazarotene", kind: "retinoid", spellings: ["tazarotene"] },
  { id: "mercury", name: "Mercury", kind: "mercury", spellings: ["mercury", "mercuric", "mercurous", "calomel", "hydrargyrum", "hydrargyri", "thimerosal", "thiomersal", "phenylmercuric"] },
  { id: "neomycin", name: "Neomycin", kind: "antibiotic", spellings: ["neomycin"] },
  { id: "gentamicin", name: "Gentamicin", kind: "antibiotic", spellings: ["gentamicin", "gentamycin"] },
  { id: "framycetin", name: "Framycetin", kind: "antibiotic", spellings: ["framycetin"] },
  { id: "fusidic", name: "Fusidic acid", kind: "antibiotic", spellings: ["fusidic", "fusidate"] },
  { id: "mupirocin", name: "Mupirocin", kind: "antibiotic", spellings: ["mupirocin"] },
  { id: "clindamycin", name: "Clindamycin", kind: "antibiotic", spellings: ["clindamycin"] },
  { id: "chloramphenicol", name: "Chloramphenicol", kind: "antibiotic", spellings: ["chloramphenicol"] },
  { id: "clotrimazole", name: "Clotrimazole", kind: "antifungal", spellings: ["clotrimazole"] },
  { id: "miconazole", name: "Miconazole", kind: "antifungal", spellings: ["miconazole"] },
  { id: "ketoconazole", name: "Ketoconazole", kind: "antifungal", spellings: ["ketoconazole"] },
  { id: "luliconazole", name: "Luliconazole", kind: "antifungal", spellings: ["luliconazole"] },
  { id: "terbinafine", name: "Terbinafine", kind: "antifungal", spellings: ["terbinafine"] },
  { id: "ornidazole", name: "Ornidazole", kind: "antifungal", spellings: ["ornidazole"] },
  { id: "tolnaftate", name: "Tolnaftate", kind: "antifungal", spellings: ["tolnaftate"] },
  { id: "clioquinol", name: "Clioquinol", kind: "antifungal", spellings: ["clioquinol", "iodochlorhydroxyquinoline", "iodochlorohydroxyquinoline"] },
];

/**
 * Ordinary cosmetic words that sit close to a medicine name. A label word that is exactly one of these
 * is never reported as a possible match ("retinol" is not tretinoin).
 */
export const SAFE_WORDS = new Set([
  "retinol", "retinal", "retinyl", "dexpanthenol", "panthenol", "betaine", "methylparaben", "propylparaben",
  "hydroxyquinoline", "quinoline", "glycerin", "glycerine", "allantoin", "arbutin", "niacinamide",
]);
