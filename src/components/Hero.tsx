import { say, type Lang } from "@/lib/copy";
import { DEMO_FACE } from "@/lib/skin/demo";

const T = {
  carton: {
    en: "An example cream carton: the pen circles clobetasol, a steroid, and stamps it Rx.",
    hi: "एक उदाहरण क्रीम का डिब्बा: पेन क्लोबेटासोल (एक स्टेरॉयड) पर गोला बनाता है और Rx की मुहर लगाता है।",
  },
  promise: { en: "“Visibly fairer in 7 days”", hi: "“7 दिन में गोरी त्वचा”" },
  stamp: { en: "Steroid. A medicine.", hi: "स्टेरॉयड। एक दवा।" },
  s1: { en: "Read the label", hi: "लेबल पढ़ें" },
  s1b: { en: "Every steroid, mercury salt and medicine on it, circled.", hi: "उस पर हर स्टेरॉयड, पारा और दवा पर गोला।" },
  s2: { en: "Scan your skin", hi: "त्वचा स्कैन करें" },
  s2b: { en: "YouCam's skin AI finds what your skin actually needs.", hi: "YouCam का स्किन AI बताता है कि आपकी त्वचा को असल में क्या चाहिए।" },
  s3: { en: "Take a card to your doctor", hi: "डॉक्टर के पास कार्ड ले जाएँ" },
  s3b: { en: "Safer steps to try now, and what to ask.", hi: "अभी के सुरक्षित कदम, और क्या पूछना है।" },
};

const SCAN = {
  label: { en: "YouCam Skin AI", hi: "YouCam स्किन AI" },
  alt: {
    en: "A sample face scanned by YouCam's skin AI, with redness marked on the cheeks and two of its scores.",
    hi: "YouCam स्किन AI से स्कैन किया गया एक नमूना चेहरा, गालों पर लाली चिह्नित, और उसके दो स्कोर।",
  },
  // Raw scores from the recorded YouCam result in lib/skin/demo-skin.json.
  rows: [
    { name: { en: "Moisture", hi: "नमी" }, score: 81 },
    { name: { en: "Redness", hi: "लाली" }, score: 96 },
  ],
};

/** The skin half of the app: YouCam's real mask and scores on its sample face. */
export function ScanCard({ lang }: { lang: Lang }) {
  return (
    <figure role="img" aria-label={say(SCAN.alt, lang)} className="w-full overflow-hidden rounded-2xl border-2 border-white/90 bg-card text-ink shadow-[0_24px_60px_-12px_rgb(0_0_0/0.55)]">
      <div className="px-4 pb-3 pt-3">
        <p className="text-xs font-semibold text-muted">{say(SCAN.label, lang)}</p>
        <ul className="mt-1.5 grid gap-1.5">
          {SCAN.rows.map((r) => (
            <li key={r.score} className="grid grid-cols-[5rem_1fr_2rem] items-center gap-2 text-sm">
              <span className="font-semibold">{say(r.name, lang)}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
                <span className="block h-full rounded-full bg-ink" style={{ width: `${r.score}%` }} />
              </span>
              <span className="text-right font-display text-lg font-bold tabular-nums leading-none">{r.score}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- YouCam's sample photo */}
        <img src={DEMO_FACE} alt="" className="absolute inset-0 size-full object-cover object-[50%_30%]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- YouCam's recorded redness mask */}
        <img src="/demo/mask-redness.png" alt="" className="absolute inset-0 size-full object-cover object-[50%_30%] opacity-60" />
        <span aria-hidden className="hero-scan absolute inset-x-0 top-0 h-0.5 bg-rx shadow-[0_0_14px_3px_var(--rx)]" />
      </div>
    </figure>
  );
}

/** The hero picture: the skin scan behind, the cream carton in front, the two halves of one check. */
export function HeroArt({ lang }: { lang: Lang }) {
  return (
    <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-[34rem] sm:pb-6 sm:pt-2">
      <div className="absolute right-0 top-0 hidden w-64 rotate-3 sm:block lg:w-72">
        <ScanCard lang={lang} />
      </div>
      <div className="relative sm:w-[21rem] sm:pt-[17rem] lg:pt-[19rem]">
        <Carton lang={lang} />
      </div>
    </div>
  );
}

/** The hero's one staged moment: a cream carton whose steroid gets circled, then stamped. */
export function Carton({ lang }: { lang: Lang }) {
  return (
    <figure role="img" aria-label={say(T.carton, lang)} className="relative mx-auto w-full max-w-[22rem] -rotate-2 select-none">
      <div className="border-2 border-ink bg-card text-ink shadow-[0_24px_50px_-16px_rgb(20_32_48/0.5)]">
        <div className="flex items-baseline justify-between gap-3 bg-ink px-4 py-2.5 text-white">
          <span className="font-display text-3xl font-bold italic leading-none">InstaFair</span>
          <span className="text-xs opacity-80">Cream · 15 g</span>
        </div>
        <p className="px-4 pt-3 text-sm italic text-muted">{say(T.promise, lang)}</p>
        <div className="mx-4 my-3 border border-ink px-3 py-2.5 font-mono text-[12.5px] leading-6" aria-hidden>
          <p className="font-semibold">Each gram contains:</p>
          <p>
            <span className="relative inline-block font-bold text-rx">
              Clobetasol
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-2.5 -inset-y-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+1.25rem)] overflow-visible">
                <path
                  d="M10 24 C6 9 38 3 62 5 C88 7 99 16 95 26 C91 36 55 39 30 37 C11 35 1 27 14 12"
                  pathLength={1}
                  fill="none"
                  stroke="var(--rx)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="carton-circle"
                />
              </svg>
            </span>{" "}
            Propionate IP 0.05% w/w
          </p>
          <p>Neomycin Sulphate IP 0.5% w/w</p>
          <p>Miconazole Nitrate IP 2% w/w</p>
          <p>Cream base q.s.</p>
        </div>
        <p className="px-4 pb-3 text-[11px] text-muted" aria-hidden>
          B. No. FC2611 · Exp. 10/2028 · For external use only
        </p>
      </div>
      <p
        className="carton-stamp absolute -right-1 -bottom-7 sm:-right-4 flex items-center gap-2 border-[3px] border-rx bg-card px-3 py-1.5 font-display text-lg font-bold text-rx shadow-sm"
        style={{ transform: "rotate(8deg)" }}
        aria-hidden
      >
        <span className="border-2 border-rx px-1 leading-tight">Rx</span>
        {say(T.stamp, lang)}
      </p>
    </figure>
  );
}

const WHY = {
  h: { en: "It's not one country's problem", hi: "यह किसी एक देश की समस्या नहीं है" },
  items: [
    {
      lead: { en: "More than 1 in 4 people", hi: "हर 4 में से 1 से ज़्यादा लोग" },
      body: {
        en: "have used a skin-lightening product, across 68 studies in Africa, Asia, Europe, the Middle East and North America.",
        hi: "त्वचा गोरी करने वाला उत्पाद इस्तेमाल कर चुके हैं: अफ़्रीका, एशिया, यूरोप, मध्य पूर्व और उत्तरी अमेरिका की 68 स्टडी में।",
      },
      src: "World Congress of Dermatology, 2023",
      href: "https://www.mdedge.com/content/can-skin-bleaching-lead-cancer",
    },
    {
      lead: { en: "Mercury is banned in cosmetics", hi: "सौंदर्य उत्पादों में पारे पर रोक है" },
      body: {
        en: "under the Minamata Convention, yet the WHO says mercury creams still reach people online and in markets.",
        hi: "मिनामाता संधि के तहत, फिर भी WHO के अनुसार पारे वाली क्रीमें ऑनलाइन और बाज़ारों में लोगों तक पहुँच रही हैं।",
      },
      src: "World Health Organization",
      href: "https://www.who.int/initiatives/elimination-of-mercury-containing-skin-lightening-products",
    },
    {
      lead: { en: "Steroid creams are medicines", hi: "स्टेरॉयड क्रीम दवा है" },
      body: {
        en: "sold as 'fairness' and pimple creams. In India, 14 of them have needed a prescription since 2018.",
        hi: "जो 'फेयरनेस' और मुँहासे की क्रीम बनकर बिकती है। भारत में 2018 से इनमें से 14 के लिए पर्चा ज़रूरी है।",
      },
      src: "Govt. of India gazette, March 2018",
      href: null,
    },
  ],
};

/** Why this matters beyond one market: three sourced facts, the source named under each. */
export function WhyItMatters({ lang }: { lang: Lang }) {
  return (
    <section aria-labelledby="why-h" className="border-t-2 border-ink pt-8">
      <h2 id="why-h" className="font-display text-3xl font-bold leading-tight sm:text-4xl">{say(WHY.h, lang)}</h2>
      <ul className="mt-5 grid gap-6 sm:grid-cols-3">
        {WHY.items.map((it) => (
          <li key={it.src} className="border-l-4 border-rx pl-4">
            <p className="font-display text-2xl font-bold leading-tight">{say(it.lead, lang)}</p>
            <p className="mt-1 text-[15px]">{say(it.body, lang)}</p>
            <p className="mt-2 text-sm text-muted">
              {it.href ? (
                <a href={it.href} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
                  {it.src}
                </a>
              ) : (
                it.src
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The three things the app does, each with a small picture of the real thing. */
export function HowItWorks({ lang }: { lang: Lang }) {
  const items = [
    {
      title: T.s1,
      body: T.s1b,
      art: (
        <p className="whitespace-nowrap rounded-md border border-ink bg-card px-3 py-1.5 font-mono text-[12px] leading-6" aria-hidden>
          <mark className="hit">Betamethasone</mark> IP 0.1%
          <br />
          Gentamicin IP 0.1%
        </p>
      ),
    },
    {
      title: T.s2,
      body: T.s2b,
      art: (
        <div className="relative size-20 overflow-hidden rounded-full border-2 border-ink" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- a small recorded sample */}
          <img src={DEMO_FACE} alt="" className="absolute inset-0 size-full object-cover object-[50%_35%]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- YouCam's recorded redness mask */}
          <img src="/demo/mask-redness.png" alt="" className="absolute inset-0 size-full object-cover object-[50%_35%] opacity-60" />
        </div>
      ),
    },
    {
      title: T.s3,
      body: T.s3b,
      art: (
        <div className="rx-pad h-20 w-32 border border-ink pl-5 pr-2 pt-1.5" aria-hidden>
          <span className="border-2 border-rx px-1 font-display text-sm font-bold text-rx">Rx</span>
          <span className="mt-2.5 block h-1 w-20 rounded bg-ink/70" />
          <span className="mt-2 block h-1 w-14 rounded bg-ink/70" />
        </div>
      ),
    },
  ];
  return (
    <ol className="grid gap-5 md:grid-cols-3">
      {items.map((it, i) => (
        <li key={i} data-reveal style={{ transitionDelay: `${i * 100}ms` }} className="grid content-start gap-5 rounded-3xl border border-line bg-paper p-7">
          <div className="flex items-center justify-between">
            <span className="grid size-11 place-items-center rounded-full bg-amber font-display text-xl font-bold">{i + 1}</span>
          </div>
          <div className="grid h-24 content-center justify-items-start">{it.art}</div>
          <div>
            <h3 className="font-display text-2xl font-bold leading-tight">{say(it.title, lang)}</h3>
            <p className="mt-1.5 text-[16px] leading-relaxed text-muted">{say(it.body, lang)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
