"use client";
import type { ReactNode } from "react";
import { checkLabel } from "@/lib/check/check";
import { say, UI, type Lang } from "@/lib/copy";
import { DEMO_FACE } from "@/lib/skin/demo";
import { Carton, HowItWorks } from "./Hero";
import { LabelInput, SAMPLES, type Checked } from "./LabelCheck";

const T = {
  pill: { en: "For 'fairness', skin-lightening and pimple creams", hi: "'फेयरनेस', गोरेपन और मुँहासे की क्रीमों के लिए" },
  h1: {
    en: ["Is there a ", "steroid", " in your face cream?"],
    hi: ["क्या आपकी फेस क्रीम में ", "स्टेरॉयड", " है?"],
  },
  cta: { en: "Check a cream", hi: "क्रीम जाँचें" },
  example: { en: "See an example", hi: "एक उदाहरण देखें" },
  trust: { en: "Free. No sign-up. The label photo never leaves your phone.", hi: "मुफ़्त। कोई साइन-अप नहीं। लेबल की फ़ोटो आपके फ़ोन से बाहर नहीं जाती।" },
  navHow: { en: "How it works", hi: "कैसे काम करता है" },
  navWhy: { en: "Why it matters", hi: "यह क्यों ज़रूरी है" },
  navFaq: { en: "Questions", hi: "सवाल" },
  scanLabel: { en: "YouCam Skin AI", hi: "YouCam स्किन AI" },
  textureMark: { en: "Skin texture, marked by YouCam Skin AI", hi: "त्वचा की बनावट, YouCam स्किन AI द्वारा चिह्नित" },
  moisture: { en: "Moisture", hi: "नमी" },
  redness: { en: "Redness", hi: "लाली" },
  found: { en: "Steroid found", hi: "स्टेरॉयड मिला" },
  artAlt: {
    en: "A cream label with clobetasol circled and stamped as a steroid, next to a face scanned by YouCam's skin AI.",
    hi: "एक क्रीम लेबल जिसमें क्लोबेटासोल पर गोला और स्टेरॉयड की मुहर है, साथ में YouCam स्किन AI से स्कैन किया गया चेहरा।",
  },
  checkH: { en: "Check your cream", hi: "अपनी क्रीम जाँचें" },
  checkSub: {
    en: "Photograph the ingredients panel or type it in. It takes about ten seconds.",
    hi: "सामग्री वाले हिस्से की फ़ोटो लें या टाइप करें। लगभग दस सेकंड लगते हैं।",
  },
  howH: { en: "How it works", hi: "यह कैसे काम करता है" },
  howSub: { en: "Three steps, all on your phone.", hi: "तीन कदम, सब आपके फ़ोन पर।" },
  flagPill: { en: "What we look for", hi: "हम क्या ढूँढते हैं" },
  flagH: { en: "Medicines hiding in beauty creams", hi: "ब्यूटी क्रीम में छिपी दवाएँ" },
  flagBody: {
    en: "We read every ingredient and circle the ones that are medicines or banned, with the strength printed next to them.",
    hi: "हम हर सामग्री पढ़ते हैं और उन पर गोला बनाते हैं जो दवा हैं या प्रतिबंधित हैं, साथ में छपी मात्रा भी।",
  },
  flags: [
    { en: "Steroids like clobetasol, betamethasone and mometasone, 23 in all", hi: "क्लोबेटासोल, बीटामेथासोन, मोमेटासोन जैसे स्टेरॉयड, कुल 23" },
    { en: "Mercury salts, banned in cosmetics worldwide", hi: "पारे के लवण, दुनिया भर में सौंदर्य उत्पादों में प्रतिबंधित" },
    { en: "Hydroquinone and tretinoin, medicines for dark patches and acne", hi: "हाइड्रोक्विनोन और ट्रेटिनॉइन, धब्बों और मुँहासों की दवाएँ" },
    { en: "Antibiotics and antifungals mixed in with a steroid", hi: "स्टेरॉयड के साथ मिले एंटीबायोटिक और एंटीफंगल" },
  ],
  verdict: { en: "This cream has a steroid in it", hi: "इस क्रीम में स्टेरॉयड है" },
  verdictBody: {
    en: "Clobetasol is a steroid: a medicine, not a beauty cream. Use it only if a doctor prescribed it for you.",
    hi: "क्लोबेटासोल एक स्टेरॉयड है: यह दवा है, ब्यूटी क्रीम नहीं। इसे तभी लगाएँ जब डॉक्टर ने लिखी हो।",
  },
  skinPill: { en: "Then, your skin", hi: "फिर, आपकी त्वचा" },
  skinH: { en: "Find what your skin actually needs", hi: "जानें आपकी त्वचा को असल में क्या चाहिए" },
  skinBody: {
    en: "Most people reach for these creams to fix something real: dark spots, pimples, dullness. One selfie with YouCam's skin AI shows what's really there, so the next step is safe.",
    hi: "लोग ये क्रीमें किसी असली परेशानी के लिए लेते हैं: धब्बे, मुँहासे, रूखापन। YouCam स्किन AI के साथ एक सेल्फ़ी दिखाती है कि असल में क्या है, ताकि अगला कदम सुरक्षित हो।",
  },
  skins: [
    { en: "Eight skin scores from one selfie", hi: "एक सेल्फ़ी से त्वचा के आठ स्कोर" },
    { en: "Where YouCam found each one, marked on your face", hi: "YouCam ने हर चीज़ कहाँ पाई, आपके चेहरे पर चिह्नित" },
    { en: "Your real skin tone, and a foundation in that shade tried on your face", hi: "आपकी त्वचा का असली रंग, और उसी शेड का फ़ाउंडेशन आपके चेहरे पर" },
    { en: "Safer products to look for, with links to shop", hi: "देखने लायक सुरक्षित उत्पाद, खरीदने के लिंक के साथ" },
    { en: "A card to show your doctor, in English or Hindi", hi: "डॉक्टर को दिखाने के लिए कार्ड, अंग्रेज़ी या हिंदी में" },
  ],
  faqH: { en: "Questions", hi: "सवाल" },
  faqs: [
    {
      q: { en: "Is my label photo uploaded?", hi: "क्या मेरी लेबल फ़ोटो अपलोड होती है?" },
      a: {
        en: "No. The label is read on your phone. Only a selfie you choose to scan is sent to YouCam for analysis, and Check First doesn't store it.",
        hi: "नहीं। लेबल आपके फ़ोन पर ही पढ़ा जाता है। सिर्फ़ वह सेल्फ़ी जो आप स्कैन के लिए चुनते हैं, विश्लेषण के लिए YouCam को जाती है, और Check First उसे सेव नहीं करता।",
      },
    },
    {
      q: { en: "I already use a steroid cream. Should I stop today?", hi: "मैं पहले से स्टेरॉयड क्रीम लगाता/लगाती हूँ। क्या आज ही बंद कर दूँ?" },
      a: {
        en: "Don't stop suddenly on your own: skin can flare up. Take the card the app makes to a dermatologist, who can plan how to stop safely.",
        hi: "अपने आप अचानक बंद न करें: त्वचा भड़क सकती है। ऐप का बनाया कार्ड त्वचा रोग विशेषज्ञ के पास ले जाएँ, वे सुरक्षित तरीके से बंद करने की योजना बना सकते हैं।",
      },
    },
    {
      q: { en: "Does it work outside India?", hi: "क्या यह भारत के बाहर भी काम करता है?" },
      a: {
        en: "Yes. Steroids, mercury and other medicines are found by name on any English label. India's prescription rules are shown when they apply.",
        hi: "हाँ। स्टेरॉयड, पारा और दूसरी दवाएँ किसी भी अंग्रेज़ी लेबल पर नाम से पहचानी जाती हैं। भारत के पर्चे वाले नियम लागू होने पर दिखाए जाते हैं।",
      },
    },
    {
      q: { en: "Is this medical advice?", hi: "क्या यह चिकित्सा सलाह है?" },
      a: {
        en: "No. Check First reads what's printed and explains it in plain words. It can't diagnose. See a dermatologist for any skin problem.",
        hi: "नहीं। Check First जो छपा है उसे पढ़कर आसान शब्दों में समझाता है। यह बीमारी की पहचान नहीं कर सकता। त्वचा की किसी भी समस्या के लिए त्वचा रोग विशेषज्ञ से मिलें।",
      },
    },
  ],
  endH: { en: "Check it before it goes on your face.", hi: "चेहरे पर लगाने से पहले जाँच लें।" },
  poweredBy: { en: "Skin analysis by YouCam AI (Perfect Corp).", hi: "त्वचा विश्लेषण: YouCam AI (Perfect Corp)।" },
};

const WHY = [
  {
    tone: "bg-rose",
    lead: { en: "More than 1 in 4", hi: "हर 4 में 1 से ज़्यादा" },
    body: {
      en: "people have used a skin-lightening product, across 68 studies in Africa, Asia, Europe, the Middle East and North America.",
      hi: "लोग त्वचा गोरी करने वाला उत्पाद इस्तेमाल कर चुके हैं: अफ़्रीका, एशिया, यूरोप, मध्य पूर्व और उत्तरी अमेरिका की 68 स्टडी में।",
    },
  },
  {
    tone: "bg-amber",
    lead: { en: "Banned, still sold", hi: "प्रतिबंधित, फिर भी बिक रही" },
    body: {
      en: "Mercury is banned in cosmetics under the Minamata Convention, yet the WHO says these creams still reach people online and in markets.",
      hi: "मिनामाता संधि के तहत सौंदर्य उत्पादों में पारा प्रतिबंधित है, फिर भी WHO के अनुसार ये क्रीमें ऑनलाइन और बाज़ारों में मिल रही हैं।",
    },
  },
  {
    tone: "bg-mint",
    lead: { en: "14 steroids", hi: "14 स्टेरॉयड" },
    body: {
      en: "have needed a doctor's prescription in India since 2018, yet are still sold over the counter as 'fairness' and pimple creams.",
      hi: "को भारत में 2018 से डॉक्टर के पर्चे की ज़रूरत है, फिर भी 'फेयरनेस' और मुँहासे की क्रीम बनकर काउंटर पर बिकते हैं।",
    },
  },
];

const SOURCES = [
  { name: "World Congress of Dermatology 2023", href: "https://www.mdedge.com/content/can-skin-bleaching-lead-cancer" },
  { name: "WHO", href: "https://www.who.int/initiatives/elimination-of-mercury-containing-skin-lightening-products" },
  { name: "Govt. of India gazette, March 2018", href: null },
];

const Pill = ({ children, className = "bg-card" }: { children: ReactNode; className?: string }) => (
  <p className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${className}`}>{children}</p>
);

const Tick = () => (
  <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-card text-sm font-bold text-ok">
    ✓
  </span>
);

const scrollToCheck = () => document.getElementById("check")?.scrollIntoView({ behavior: "smooth", block: "start" });

export function Nav({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-display text-2xl font-bold leading-none">
          <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-rx text-base text-white">
            ✓
          </span>
          Check First
        </a>
        <nav className="hidden items-center gap-7 text-[15px] font-semibold md:flex">
          <a href="#how" className="hover:text-rx">{say(T.navHow, lang)}</a>
          <a href="#why" className="hover:text-rx">{say(T.navWhy, lang)}</a>
          <a href="#faq" className="hover:text-rx">{say(T.navFaq, lang)}</a>
        </nav>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Language" className="flex rounded-full border border-line bg-card p-0.5">
            {(["en", "hi"] as const).map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} className={`min-h-9 min-w-10 rounded-full px-2.5 text-sm font-semibold ${lang === l ? "bg-ink text-white" : ""}`}>
                {l === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>
          <a href="#check" className="hidden min-h-10 items-center rounded-full bg-rx px-5 font-semibold text-white transition hover:brightness-110 sm:inline-flex">
            {say(T.cta, lang)}
          </a>
        </div>
      </div>
    </header>
  );
}

/** The hero picture: a face in an arch, YouCam's scores floating at its shoulder, the stamped carton in front. */
function HeroArt({ lang }: { lang: Lang }) {
  return (
    <div role="img" aria-label={say(T.artAlt, lang)} className="relative mx-auto aspect-[5/6] w-full max-w-[26rem] lg:max-w-[30rem]">
      <div className="hero-in absolute right-0 top-0 h-[86%] w-[76%] overflow-hidden rounded-b-[2rem] rounded-t-[999px] bg-rose shadow-[0_30px_60px_-20px_rgb(20_32_48/0.35)]" style={{ animationDelay: "100ms" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- YouCam's sample photo */}
        <img src={DEMO_FACE} alt="" className="absolute inset-0 size-full object-cover object-[50%_28%]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- YouCam's recorded redness mask */}
        <img src="/demo/mask-redness.png" alt="" className="absolute inset-0 size-full object-cover object-[50%_28%] opacity-60" />
        <span aria-hidden className="hero-scan absolute inset-x-0 top-0 h-0.5 bg-rx shadow-[0_0_14px_3px_var(--rx)]" />
      </div>

      <div className="hero-in absolute -right-2 top-[14%] sm:-right-6" style={{ animationDelay: "500ms" }}>
        <div className="float-a w-44 rounded-2xl bg-card p-3 shadow-[0_18px_40px_-12px_rgb(20_32_48/0.35)] sm:w-52">
          <p className="text-xs font-semibold text-muted">{say(T.scanLabel, lang)}</p>
          {[
            [T.moisture, 81],
            [T.redness, 96],
          ].map(([name, score]) => (
            <p key={score as number} className="mt-1.5 grid grid-cols-[1fr_auto] items-center gap-x-2 text-sm">
              <span className="font-semibold">{say(name as typeof T.moisture, lang)}</span>
              <span className="font-display text-lg font-bold tabular-nums leading-none">{score as number}</span>
              <span className="col-span-2 mt-1 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
                <span className="block h-full rounded-full bg-ok" style={{ width: `${score}%` }} />
              </span>
            </p>
          ))}
        </div>
      </div>

      <div className="hero-in absolute -left-2 bottom-0 sm:-left-8" style={{ animationDelay: "300ms" }}>
        <div className="float-b origin-bottom-left scale-[0.72] sm:scale-[0.85]">
          <div className="w-[21rem]">
            <Carton lang={lang} />
          </div>
        </div>
      </div>

      <div className="hero-in absolute right-[10%] top-[58%] hidden sm:block" style={{ animationDelay: "1700ms" }}>
        <p className="float-a flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lg">
          <span aria-hidden className="size-2.5 rounded-full bg-rx" />
          {say(T.found, lang)}
        </p>
      </div>
    </div>
  );
}

export function Landing({ lang, onChecked }: { lang: Lang; onChecked: (c: Checked) => void }) {
  const [before, word, after] = T.h1[lang];
  const runExample = () => onChecked({ text: SAMPLES[0].text, result: checkLabel(SAMPLES[0].text), source: "sample" });

  return (
    <div className="no-print">
      <section className="relative overflow-x-clip">
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 size-[34rem] rounded-full bg-rose/70 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-32 top-1/3 size-[26rem] rounded-full bg-amber/60 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-x-12 gap-y-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pb-28 lg:pt-20">
          <div>
            <div className="hero-in">
              <Pill className="bg-rose text-rx">{say(T.pill, lang)}</Pill>
            </div>
            <h1 className="hero-in mt-6 font-display text-[3.1rem] font-bold leading-[0.98] sm:text-6xl lg:text-[4.75rem]" style={{ animationDelay: "80ms" }}>
              {before}
              <span className="relative inline-block whitespace-nowrap text-rx">
                {word}
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)] overflow-visible">
                  <path d="M10 24 C6 9 38 3 62 5 C88 7 99 16 95 26 C91 36 55 39 30 37 C11 35 1 27 14 12" pathLength={1} fill="none" stroke="var(--rx)" strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" className="title-circle" />
                </svg>
              </span>
              {after}
            </h1>
            <p className="hero-in mt-6 max-w-xl text-lg leading-relaxed text-muted" style={{ animationDelay: "160ms" }}>
              {say(UI.intro, lang)}
            </p>
            <div className="hero-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
              <button type="button" onClick={scrollToCheck} className="min-h-14 rounded-full bg-rx px-8 text-lg font-semibold text-white shadow-[0_12px_24px_-10px_var(--rx)] transition hover:-translate-y-0.5 hover:brightness-110">
                {say(T.cta, lang)}
              </button>
              <button type="button" onClick={runExample} className="min-h-14 rounded-full border-2 border-ink bg-card px-8 text-lg font-semibold transition hover:-translate-y-0.5">
                {say(T.example, lang)}
              </button>
            </div>
            <p className="hero-in mt-5 flex items-center gap-2 text-sm text-muted" style={{ animationDelay: "320ms" }}>
              <span aria-hidden>🔒</span>
              {say(T.trust, lang)}
            </p>
          </div>
          <HeroArt lang={lang} />
        </div>
      </section>

      <section id="why" aria-label={say(T.navWhy, lang)} className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6">
        <ul className="grid gap-4 md:grid-cols-3">
          {WHY.map((w, i) => (
            <li key={w.tone} data-reveal style={{ transitionDelay: `${i * 90}ms` }} className={`rounded-3xl p-7 ${w.tone}`}>
              <p className="font-display text-4xl font-bold leading-tight">{say(w.lead, lang)}</p>
              <p className="mt-2 text-[17px] leading-relaxed">{say(w.body, lang)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Sources:{" "}
          {SOURCES.map((s, i) => (
            <span key={s.name}>
              {s.href ? (
                <a href={s.href} target="_blank" rel="noreferrer" className="underline decoration-rx underline-offset-2 hover:text-ink">
                  {s.name}
                </a>
              ) : (
                s.name
              )}
              {i < SOURCES.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
      </section>

      <section id="check" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-5xl font-bold leading-tight">{say(T.checkH, lang)}</h2>
          <p className="mt-3 text-lg text-muted">{say(T.checkSub, lang)}</p>
        </div>
        <div data-reveal className="mx-auto mt-10 max-w-xl">
          <LabelInput lang={lang} onChecked={onChecked} />
          <p className="mt-6 border-l-4 border-rx pl-4 text-muted">{say(UI.tip, lang)}</p>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 bg-card px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="text-center">
            <h2 className="font-display text-5xl font-bold leading-tight">{say(T.howH, lang)}</h2>
            <p className="mt-3 text-lg text-muted">{say(T.howSub, lang)}</p>
          </div>
          <div className="mt-12">
            <HowItWorks lang={lang} />
          </div>
        </div>
      </section>

      <section className="bg-amber px-4 py-24 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <div data-reveal>
            <Pill>{say(T.flagPill, lang)}</Pill>
            <h2 className="mt-5 font-display text-5xl font-bold leading-[1.02]">{say(T.flagH, lang)}</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed">{say(T.flagBody, lang)}</p>
            <ul className="mt-7 grid gap-3">
              {T.flags.map((f) => (
                <li key={f.en} className="flex gap-3 text-[17px] font-semibold">
                  <Tick />
                  {say(f, lang)}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal style={{ transitionDelay: "120ms" }} className="mx-auto w-full max-w-md -rotate-1 overflow-hidden rounded-3xl bg-card shadow-[0_30px_60px_-24px_rgb(20_32_48/0.45)]">
            <div className="flex items-center gap-3 bg-rx px-6 py-5 text-white">
              <span className="grid size-11 shrink-0 place-items-center border-2 border-white font-display text-xl font-bold">Rx</span>
              <p className="font-display text-3xl font-bold leading-tight">{say(T.verdict, lang)}</p>
            </div>
            <div className="p-6">
              <p className="flex flex-wrap gap-2">
                <span className="rounded-full border-2 border-rx px-3 py-1 text-sm font-bold text-rx">Clobetasol 0.05%</span>
                <span className="rounded-full border-2 border-line px-3 py-1 text-sm font-semibold">Neomycin 0.5%</span>
                <span className="rounded-full border-2 border-line px-3 py-1 text-sm font-semibold">Miconazole 2%</span>
              </p>
              <p className="mt-4 leading-relaxed">{say(T.verdictBody, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mint px-4 py-24 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <div data-reveal className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-24px_rgb(20_32_48/0.45)] lg:order-none">
            {/* eslint-disable-next-line @next/next/no-img-element -- YouCam's sample photo */}
            <img src={DEMO_FACE} alt="" className="absolute inset-0 size-full object-cover object-[50%_30%]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- YouCam's recorded texture mask */}
            <img src="/demo/mask-texture.png" alt="" className="absolute inset-0 size-full object-cover object-[50%_30%] opacity-70" />
            <p className="absolute bottom-4 left-4 right-4 rounded-2xl bg-card/95 px-4 py-3 text-sm font-semibold shadow-lg">
              {say(T.textureMark, lang)}
            </p>
          </div>
          <div data-reveal style={{ transitionDelay: "120ms" }}>
            <Pill>{say(T.skinPill, lang)}</Pill>
            <h2 className="mt-5 font-display text-5xl font-bold leading-[1.02]">{say(T.skinH, lang)}</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed">{say(T.skinBody, lang)}</p>
            <ul className="mt-7 grid gap-3">
              {T.skins.map((f) => (
                <li key={f.en} className="flex gap-3 text-[17px] font-semibold">
                  <Tick />
                  {say(f, lang)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 data-reveal className="text-center font-display text-5xl font-bold leading-tight">{say(T.faqH, lang)}</h2>
          <div className="mt-10 grid gap-3">
            {T.faqs.map((f) => (
              <details key={f.q.en} data-reveal className="group rounded-2xl border border-line bg-card px-6 py-5 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {say(f.q, lang)}
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-rose text-rx transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{say(f.a, lang)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6">
        <div data-reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white sm:px-12">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-rx/40 blur-3xl" />
          <h2 className="relative font-display text-4xl font-bold leading-tight sm:text-5xl">{say(T.endH, lang)}</h2>
          <button type="button" onClick={scrollToCheck} className="relative mt-8 min-h-14 rounded-full bg-rx px-8 text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110">
            {say(T.cta, lang)}
          </button>
        </div>
      </section>
    </div>
  );
}

export const POWERED_BY = T.poweredBy;
