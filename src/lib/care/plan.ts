// What to do next, without a prescription. Fixed rules, no AI: every line here was written and reviewed by hand.
// Only cosmetic categories. Never a medicine, never "this will cure", never "stop using".

import type { Concern, SkinReading } from "@/lib/skin/normalize";

export type T = { en: string; hi: string };

/** What the person told us they want the cream for. */
export const GOALS = ["fairer", "spots", "acne", "rash", "dry", "oily"] as const;
export type Goal = (typeof GOALS)[number];

export const GOAL_LABEL: Record<Goal, T> = {
  fairer: { en: "Fairer or brighter skin", hi: "गोरी या निखरी त्वचा" },
  spots: { en: "Dark spots or marks", hi: "काले धब्बे या निशान" },
  acne: { en: "Pimples", hi: "मुँहासे" },
  rash: { en: "Itching, rash or redness", hi: "खुजली, दाने या लाली" },
  dry: { en: "Dry skin", hi: "रूखी त्वचा" },
  oily: { en: "Oily skin", hi: "तैलीय त्वचा" },
};

export const CONCERN_LABEL: Record<Concern, T> = {
  age_spot: { en: "Spots and uneven tone", hi: "धब्बे और असमान रंग" },
  acne: { en: "Pimples", hi: "मुँहासे" },
  redness: { en: "Redness", hi: "लाली" },
  texture: { en: "Texture", hi: "बनावट" },
  oiliness: { en: "Oiliness", hi: "तैलीयपन" },
  moisture: { en: "Moisture", hi: "नमी" },
  radiance: { en: "Glow", hi: "चमक" },
  pore: { en: "Pores", hi: "रोमछिद्र" },
};

export type Step = {
  id: string;
  title: T;
  why: T;
  /** Words to look for on the label. */
  lookFor: string[];
  /** Search phrase for the shopping links. */
  search: string;
};

const SUNSCREEN: Step = {
  id: "sunscreen",
  title: { en: "Sunscreen every morning", hi: "हर सुबह सनस्क्रीन" },
  why: {
    en: "Sun makes dark spots and tan darker. Daily sunscreen is the one step that protects every skin tone.",
    hi: "धूप से धब्बे और टैनिंग और गहरे होते हैं। रोज़ सनस्क्रीन हर रंग की त्वचा की रक्षा करता है।",
  },
  lookFor: ["SPF 30 or more", "PA+++", "broad spectrum"],
  search: "sunscreen spf 50 pa++++",
};
const CLEANSER: Step = {
  id: "cleanser",
  title: { en: "A gentle face wash", hi: "हल्का फेस वॉश" },
  why: { en: "Twice a day, without scrubbing. Harsh washing makes redness and pimples worse.", hi: "दिन में दो बार, बिना रगड़े। तेज़ फेस वॉश लाली और मुँहासे बढ़ाते हैं।" },
  lookFor: ["gentle", "fragrance-free", "pH balanced"],
  search: "gentle face wash fragrance free",
};
const MOISTURISER: Step = {
  id: "moisturiser",
  title: { en: "A plain moisturiser", hi: "सादा मॉइस्चराइज़र" },
  why: { en: "Calms dry or irritated skin and protects its barrier.", hi: "रूखी या चिड़चिड़ी त्वचा को आराम देता है और उसकी परत को बचाता है।" },
  lookFor: ["ceramides", "glycerin", "fragrance-free"],
  search: "ceramide moisturiser fragrance free",
};
const NIACINAMIDE: Step = {
  id: "niacinamide",
  title: { en: "A niacinamide serum", hi: "नियासिनामाइड सीरम" },
  why: { en: "A cosmetic ingredient that can help even out marks over weeks. Start every other day.", hi: "एक कॉस्मेटिक तत्व जो हफ़्तों में निशान हल्के करने में मदद कर सकता है। एक दिन छोड़कर शुरू करें।" },
  lookFor: ["niacinamide 2–5%"],
  search: "niacinamide serum 5%",
};
const SALICYLIC: Step = {
  id: "salicylic",
  title: { en: "A salicylic acid face wash", hi: "सैलिसिलिक एसिड फेस वॉश" },
  why: { en: "Helps keep pores clear. Use once a day to start; stop if it stings.", hi: "रोमछिद्र साफ़ रखने में मदद करता है। दिन में एक बार से शुरू करें; जलन हो तो बंद करें।" },
  lookFor: ["salicylic acid 0.5–2%"],
  search: "salicylic acid face wash",
};
const OIL_FREE: Step = {
  id: "oilfree",
  title: { en: "An oil-free gel moisturiser", hi: "ऑयल-फ़्री जेल मॉइस्चराइज़र" },
  why: { en: "Oily skin still needs moisture; a light gel won't clog pores.", hi: "तैलीय त्वचा को भी नमी चाहिए; हल्का जेल रोमछिद्र बंद नहीं करता।" },
  lookFor: ["oil-free", "non-comedogenic"],
  search: "oil free gel moisturiser non comedogenic",
};

/** Cosmetic steps for each skin concern YouCam scores. */
const FOR_CONCERN: Record<Concern, Step[]> = {
  age_spot: [SUNSCREEN, NIACINAMIDE],
  acne: [CLEANSER, SALICYLIC, OIL_FREE],
  redness: [CLEANSER, MOISTURISER, SUNSCREEN],
  texture: [CLEANSER, MOISTURISER],
  oiliness: [CLEANSER, OIL_FREE],
  moisture: [MOISTURISER],
  radiance: [SUNSCREEN, MOISTURISER],
  pore: [SALICYLIC, OIL_FREE],
};

const GOAL_CONCERN: Record<Goal, Concern[]> = {
  fairer: ["age_spot", "radiance"],
  spots: ["age_spot"],
  acne: ["acne"],
  rash: ["redness"],
  dry: ["moisture"],
  oily: ["oiliness"],
};

/** Signs dermatologists link to steroid creams on the face (IJDVL 2011 multicentre study). Ticked by the user, never inferred. */
export const WARNING_SIGNS = ["worse_when_stopped", "burning", "redness", "pimples_after", "thin_veins", "hair"] as const;
export type WarningSign = (typeof WARNING_SIGNS)[number];
export const SIGN_LABEL: Record<WarningSign, T> = {
  worse_when_stopped: { en: "Skin gets worse when I stop the cream", hi: "क्रीम छोड़ने पर त्वचा और खराब हो जाती है" },
  burning: { en: "Burning or stinging", hi: "जलन या चुभन" },
  redness: { en: "Redness that won't go away", hi: "लाली जो जाती नहीं" },
  pimples_after: { en: "New pimples since I started the cream", hi: "क्रीम शुरू करने के बाद नए मुँहासे" },
  thin_veins: { en: "Thin skin or visible small veins", hi: "पतली त्वचा या दिखती छोटी नसें" },
  hair: { en: "More facial hair", hi: "चेहरे पर ज़्यादा बाल" },
};

export type Plan = {
  /** Concerns to work on, in order: what they asked for first, then what the scan scored lowest. */
  focus: Concern[];
  steps: Step[];
  /** See a dermatologist, and why. Empty means no red flag was reported. */
  doctor: T[];
  /** An honest word about the goal itself, if it needs one. */
  note?: T;
};

export const PATCH_TEST: T = {
  en: "Try anything new on a small patch near your jaw for 2 days first.",
  hi: "कोई भी नई चीज़ पहले 2 दिन जबड़े के पास छोटी जगह पर लगाकर देखें।",
};

export function makePlan(input: { goal: Goal; reading?: SkinReading; usingFlagged: boolean; signs: WarningSign[] }): Plan {
  const asked = GOAL_CONCERN[input.goal];
  const lowest = (input.reading?.scores ?? []).slice(0, 2).map((s) => s.concern);
  const focus = [...new Set([...asked, ...lowest])].slice(0, 3);
  const steps: Step[] = [];
  for (const c of focus) for (const s of FOR_CONCERN[c]) if (!steps.some((x) => x.id === s.id)) steps.push(s);
  if (!steps.some((s) => s.id === "sunscreen")) steps.push(SUNSCREEN);

  const doctor: T[] = [];
  if (input.signs.length > 0) {
    doctor.push({
      en: "The signs you ticked can follow using a steroid cream on the face. A dermatologist can check your skin and plan how to stop safely.",
      hi: "आपने जो लक्षण चुने, वे चेहरे पर स्टेरॉयड क्रीम लगाने के बाद हो सकते हैं। त्वचा रोग विशेषज्ञ जाँच करके सुरक्षित तरीके से छोड़ने की योजना बना सकते हैं।",
    });
  }
  if (input.usingFlagged) {
    doctor.push({
      en: "You're using a cream with a medicine in it. Don't stop suddenly: show it to a doctor first, because skin can flare when a steroid is stopped.",
      hi: "आप ऐसी क्रीम लगा रहे हैं जिसमें दवा है। अचानक बंद न करें: पहले डॉक्टर को दिखाएँ, क्योंकि स्टेरॉयड छोड़ने पर त्वचा भड़क सकती है।",
    });
  }
  if (input.goal === "rash") {
    doctor.push({
      en: "Itching or a rash can be an infection that needs the right medicine. A doctor can tell which; a steroid cream can make some infections spread.",
      hi: "खुजली या दाने किसी संक्रमण से हो सकते हैं जिसे सही दवा चाहिए। डॉक्टर बता सकते हैं; स्टेरॉयड क्रीम से कुछ संक्रमण फैल सकते हैं।",
    });
  }
  const note: T | undefined =
    input.goal === "fairer"
      ? {
          en: "No safe cream changes the colour you were born with. What usually looks 'dark' is tan and spots, and those are what sunscreen and gentle care help with.",
          hi: "कोई भी सुरक्षित क्रीम आपका जन्मजात रंग नहीं बदलती। जो 'काला' दिखता है वह अक्सर टैनिंग और धब्बे होते हैं, और उन्हीं में सनस्क्रीन और हल्की देखभाल मदद करती है।",
        }
      : undefined;
  return { focus, steps, doctor, note };
}
