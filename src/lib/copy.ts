// Every sentence the label check can say, in English and Hindi. Written by hand; no AI writes advice at runtime.

import type { CheckResult, Finding } from "@/lib/check/check";
import type { T } from "@/lib/care/plan";

export type Lang = "en" | "hi";
export const say = (t: T, lang: Lang) => t[lang];

export type VerdictCopy = { tone: "rx" | "warn" | "ok"; title: T; body: T[] };

const names = (fs: Finding[]) => fs.map((f) => f.rule.name).join(", ");

export function verdictCopy(r: CheckResult): VerdictCopy {
  const exact = r.findings.filter((f) => f.match === "exact");
  const steroids = exact.filter((f) => f.rule.kind === "steroid");
  const body: T[] = [];
  const kinds = new Set(exact.map((f) => f.rule.kind));

  if (r.verdict === "steroid") {
    body.push({
      en: `${names(steroids)} is a steroid: a medicine, not a beauty cream. Used on the face for fairness or pimples, steroids can thin the skin, bring redness and pimples, and make skin depend on the cream. Use it only if a doctor prescribed it for you.`,
      hi: `${names(steroids)} एक स्टेरॉयड है: यह दवा है, ब्यूटी क्रीम नहीं। गोरेपन या मुँहासों के लिए चेहरे पर लगाने से त्वचा पतली हो सकती है, लाली और मुँहासे आ सकते हैं, और त्वचा क्रीम पर निर्भर हो सकती है। इसे तभी लगाएँ जब डॉक्टर ने आपके लिए लिखी हो।`,
    });
    const listed = steroids.filter((f) => f.rule.scheduleH2018);
    if (listed.length > 0) {
      body.push({
        en: `Since March 2018, ${names(listed)} creams are Schedule H in India: a chemist should sell them only on a doctor's prescription.`,
        hi: `मार्च 2018 से भारत में ${names(listed)} वाली क्रीम शेड्यूल H में हैं: केमिस्ट इन्हें केवल डॉक्टर के पर्चे पर ही बेच सकते हैं।`,
      });
    }
    if (r.combination) {
      body.push({
        en: "It also mixes an antibiotic or antifungal with the steroid. Mixes like this are for specific infections a doctor diagnoses; on a fungal rash a steroid can make it spread.",
        hi: "इसमें स्टेरॉयड के साथ एंटीबायोटिक या एंटीफंगल भी मिला है। ऐसे मिश्रण डॉक्टर द्वारा पहचाने गए खास संक्रमणों के लिए होते हैं; फंगल दाद पर स्टेरॉयड उसे और फैला सकता है।",
      });
    }
  }
  if (kinds.has("mercury")) {
    body.push({
      en: "It contains mercury. The WHO warns that mercury in skin-lightening creams can damage the kidneys and nerves, and the Minamata Convention bans it in cosmetics. Don't use it.",
      hi: "इसमें पारा (मरकरी) है। WHO चेतावनी देता है कि त्वचा गोरी करने वाली क्रीमों में पारा गुर्दों और नसों को नुकसान पहुँचा सकता है, और मिनामाता संधि सौंदर्य उत्पादों में इस पर रोक लगाती है। इसका इस्तेमाल न करें।",
    });
  }
  if (kinds.has("hydroquinone")) {
    body.push({
      en: "Hydroquinone is a medicine for dark patches. Since April 2019 it is Schedule H in India: use it only with a doctor's advice.",
      hi: "हाइड्रोक्विनोन काले धब्बों की दवा है। अप्रैल 2019 से भारत में यह शेड्यूल H में है: इसे केवल डॉक्टर की सलाह से लगाएँ।",
    });
  }
  if (kinds.has("retinoid")) {
    body.push({
      en: `${names(exact.filter((f) => f.rule.kind === "retinoid"))} is a medicine (a retinoid). It can irritate skin and isn't for pregnancy: use it only with a doctor's advice.`,
      hi: `${names(exact.filter((f) => f.rule.kind === "retinoid"))} एक दवा (रेटिनॉइड) है। इससे जलन हो सकती है और गर्भावस्था में नहीं लगानी चाहिए: केवल डॉक्टर की सलाह से लगाएँ।`,
    });
  }
  if (r.verdict === "medicine" && (kinds.has("antibiotic") || kinds.has("antifungal"))) {
    body.push({
      en: "It has an antibiotic or antifungal: a medicine for infections, to use as a doctor advises, not as a daily face cream.",
      hi: "इसमें एंटीबायोटिक या एंटीफंगल है: यह संक्रमण की दवा है, जिसे डॉक्टर की सलाह से लगाना है, रोज़ की फेस क्रीम की तरह नहीं।",
    });
  }

  switch (r.verdict) {
    case "steroid":
      return { tone: "rx", title: { en: "This cream has a steroid in it", hi: "इस क्रीम में स्टेरॉयड है" }, body };
    case "mercury":
      return { tone: "rx", title: { en: "This cream has mercury in it", hi: "इस क्रीम में पारा (मरकरी) है" }, body };
    case "medicine":
      return { tone: "rx", title: { en: "This cream has a medicine in it", hi: "इस क्रीम में दवा है" }, body };
    case "possible": {
      const f = r.findings[0];
      return {
        tone: "warn",
        title: { en: `Possibly ${f.rule.name}: check the label`, hi: `शायद ${f.rule.name}: लेबल जाँचें` },
        body: [{
          en: `We read "${f.found}", which looks like ${f.rule.name}, but the photo isn't clear enough to be sure. Look for this word on the label, or type the ingredients in.`,
          hi: `हमने "${f.found}" पढ़ा, जो ${f.rule.name} जैसा दिखता है, लेकिन फ़ोटो साफ़ नहीं है। लेबल पर यह शब्द देखें, या सामग्री टाइप करें।`,
        }],
      };
    }
    case "none":
      return {
        tone: "ok",
        title: { en: "No steroid or medicine from our list", hi: "हमारी सूची का कोई स्टेरॉयड या दवा नहीं मिली" },
        body: [{
          en: "That doesn't make it right for your skin, and we only know what's printed. Try it on a small patch first.",
          hi: "इसका मतलब यह नहीं कि यह आपकी त्वचा के लिए सही है; हम केवल छपी जानकारी जानते हैं। पहले छोटी जगह पर लगाकर देखें।",
        }],
      };
    case "unreadable":
      return {
        tone: "warn",
        title: { en: "We couldn't read enough of the label", hi: "हम लेबल पूरा नहीं पढ़ पाए" },
        body: [{
          en: "Take a sharp, close photo of the ingredients panel in good light, or type the ingredients in.",
          hi: "अच्छी रोशनी में सामग्री वाले हिस्से की साफ़, पास से फ़ोटो लें, या सामग्री टाइप करें।",
        }],
      };
  }
}

export const UI = {
  tagline: { en: "Check a face cream before you buy it.", hi: "फेस क्रीम खरीदने से पहले जाँचें।" },
  intro: {
    en: "Around the world, 'fairness', skin-lightening and pimple creams are sold with steroids or mercury inside. Photograph the label or type it in: we'll show you exactly what's in it.",
    hi: "दुनिया भर में 'फेयरनेस', त्वचा गोरी करने वाली और मुँहासे की क्रीमें अंदर स्टेरॉयड या पारे के साथ बिकती हैं। लेबल की फ़ोटो लें या टाइप करें: हम दिखाएँगे कि इसमें ठीक-ठीक क्या है।",
  },
  photoTab: { en: "Photo of the label", hi: "लेबल की फ़ोटो" },
  typeTab: { en: "Type the ingredients", hi: "सामग्री टाइप करें" },
  takePhoto: { en: "Take or choose a photo", hi: "फ़ोटो लें या चुनें" },
  reading: { en: "Reading the label on your phone…", hi: "आपके फ़ोन पर लेबल पढ़ा जा रहा है…" },
  check: { en: "Check this label", hi: "यह लेबल जाँचें" },
  placeholder: { en: "e.g. Each gram contains: … IP 0.05% w/w", hi: "जैसे: प्रत्येक ग्राम में: … IP 0.05% w/w" },
  examples: { en: "Or try a sample label:", hi: "या एक नमूना लेबल आज़माएँ:" },
  tip: {
    en: "Tip: medicine creams print a strength like '0.05% w/w' next to each ingredient. Seeing that on a face cream is a reason to check.",
    hi: "सुझाव: दवा वाली क्रीमों पर हर सामग्री के साथ '0.05% w/w' जैसी मात्रा छपी होती है। फेस क्रीम पर यह दिखे तो ज़रूर जाँचें।",
  },
  whatWeRead: { en: "What we read on the label", hi: "लेबल पर हमने क्या पढ़ा" },
  photoStays: { en: "The label photo is read on your phone and never uploaded.", hi: "लेबल की फ़ोटो आपके फ़ोन पर ही पढ़ी जाती है, कहीं अपलोड नहीं होती।" },
  checkAnother: { en: "Check another cream", hi: "दूसरी क्रीम जाँचें" },
  notAdvice: {
    en: "Check First reads labels and gives general skin-care information. It is not medical advice and cannot diagnose. See a dermatologist for any skin problem.",
    hi: "Check First लेबल पढ़ता है और त्वचा की देखभाल की सामान्य जानकारी देता है। यह चिकित्सा सलाह नहीं है और बीमारी की पहचान नहीं कर सकता। त्वचा की किसी भी समस्या के लिए त्वचा रोग विशेषज्ञ से मिलें।",
  },
} satisfies Record<string, T>;
