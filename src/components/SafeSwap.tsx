"use client";
import { useState } from "react";
import { say, type Lang } from "@/lib/copy";
import recorded from "@/lib/skin/demo-tone.json";
import { shops } from "./PlanView";
import type { Scan } from "./SkinScan";

/** A shop-search word for the shade: light, medium or deep, from the colour's luminance. */
function depth(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return l > 0.62 ? "light" : l > 0.4 ? "medium" : "deep";
}

type Swap = { skin: string; eye: string; hair: string; after: string; source: "live" | "demo" };

// A real YouCam result on the sample face, recorded on 2 Nov 2026 by scripts/probe-tone.mjs.
const DEMO: Swap = {
  skin: recorded.color.skin_color,
  eye: recorded.color.eye_color_name,
  hair: recorded.color.hair_color_name,
  after: "/demo/vto-foundation.jpg",
  source: "demo",
};

const T = {
  pill: { en: "The safe swap", hi: "सुरक्षित विकल्प" },
  h: { en: "Even-looking skin today, without bleach", hi: "आज ही एक-सी दिखने वाली त्वचा, बिना ब्लीच के" },
  body: {
    en: "YouCam reads your skin's own colour, then tries a foundation in that exact shade on your face. It evens out spots and redness, and it washes off. No steroid, no mercury.",
    hi: "YouCam आपकी त्वचा का असली रंग पढ़ता है, फिर उसी शेड का फ़ाउंडेशन आपके चेहरे पर आज़माता है। यह धब्बे और लाली को एक-सा करता है, और धुल जाता है। न स्टेरॉयड, न पारा।",
  },
  show: { en: "Show it on my face", hi: "मेरे चेहरे पर दिखाएँ" },
  busy: { en: "YouCam is matching your shade…", hi: "YouCam आपका शेड मिला रहा है…" },
  before: { en: "Before", hi: "पहले" },
  after: { en: "With your shade", hi: "आपके शेड के साथ" },
  drag: { en: "Drag to compare", hi: "तुलना के लिए खिसकाएँ" },
  yours: { en: "Your skin tone", hi: "आपकी त्वचा का रंग" },
  nothing: { en: "Healthy as it is. Protect it with sunscreen; there's nothing to bleach.", hi: "जैसी है वैसी ही स्वस्थ है। सनस्क्रीन से बचाएँ; ब्लीच करने जैसा कुछ नहीं है।" },
  shopFor: { en: "Shop a foundation or tinted sunscreen in this shade", hi: "इस शेड का फ़ाउंडेशन या टिंटेड सनस्क्रीन खरीदें" },
  apis: { en: "YouCam Skin Tone Analysis + Makeup Virtual Try-On", hi: "YouCam स्किन टोन एनालिसिस + मेकअप वर्चुअल ट्राई-ऑन" },
  demoNote: { en: "Sample: a real YouCam result recorded on 2 Nov 2026.", hi: "नमूना: 2 नवंबर 2026 को रिकॉर्ड किया गया असली YouCam परिणाम।" },
  liveNote: { en: "Live YouCam result for your photo.", hi: "आपकी फ़ोटो का लाइव YouCam परिणाम।" },
};

export function SafeSwap({ lang, scan }: { lang: Lang; scan: Scan }) {
  const [swap, setSwap] = useState<Swap | null>(null);
  const [busy, setBusy] = useState(false);
  const [split, setSplit] = useState(50);

  async function show() {
    if (!scan.fileId) return setSwap(DEMO);
    setBusy(true);
    try {
      const r = await (await fetch("/api/swap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileId: scan.fileId }) })).json();
      setSwap(r.mode === "live" ? { skin: r.skin, eye: r.eye, hair: r.hair, after: r.after, source: "live" } : DEMO);
    } catch {
      setSwap(DEMO);
    } finally {
      setBusy(false);
    }
  }

  // The recorded try-on belongs to the sample face, so a fallback shows it on that face.
  const before = swap?.source === "demo" ? "/demo/face.jpg" : scan.photo;

  return (
    <section aria-labelledby="swap-h" className="overflow-hidden rounded-3xl bg-mint p-5 sm:p-7">
      <p className="inline-flex rounded-full bg-card px-3 py-1 text-sm font-semibold">{say(T.pill, lang)}</p>
      <h2 id="swap-h" className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">{say(T.h, lang)}</h2>
      <p className="mt-2 max-w-prose">{say(T.body, lang)}</p>

      {!swap && (
        <button type="button" onClick={show} disabled={busy} className="mt-5 min-h-12 rounded-full bg-ink px-6 font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-70">
          {busy ? say(T.busy, lang) : say(T.show, lang)}
        </button>
      )}

      {swap && (
        <div className="appear mt-6 grid gap-6 sm:grid-cols-[minmax(0,17rem)_1fr] sm:items-start">
          <figure className="relative mx-auto w-full max-w-[17rem] select-none overflow-hidden rounded-2xl shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element -- the photo before the try-on */}
            <img src={before} alt={say(T.before, lang)} className="block w-full" />
            {/* eslint-disable-next-line @next/next/no-img-element -- YouCam's try-on result */}
            <img src={swap.after} alt={say(T.after, lang)} className="absolute inset-0 size-full object-cover" style={{ clipPath: `inset(0 0 0 ${split}%)` }} />
            <span aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${split}%` }} />
            <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-semibold text-white">{say(T.before, lang)}</span>
            <span className="absolute right-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-xs font-semibold">{say(T.after, lang)}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
              aria-label={say(T.drag, lang)}
              className="absolute inset-0 size-full cursor-ew-resize opacity-0"
            />
          </figure>
          <div>
            <p className="text-sm font-semibold text-muted">{say(T.yours, lang)}</p>
            <p className="mt-2 flex items-center gap-3">
              <span aria-hidden className="size-14 rounded-2xl border-2 border-white shadow" style={{ background: swap.skin }} />
              <span className="font-mono text-lg font-semibold">{swap.skin.toUpperCase()}</span>
            </p>
            <p className="mt-3 max-w-prose font-semibold">{say(T.nothing, lang)}</p>
            <p className="mt-5 text-sm font-semibold">{say(T.shopFor, lang)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {shops().map((s) => (
                <a key={s.name} href={s.url(`${depth(swap.skin)} shade foundation`)} target="_blank" rel="noreferrer" className="rounded-full bg-card px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-white">
                  {s.name}
                </a>
              ))}
            </div>
            <p className="mt-5 text-xs text-muted">
              {say(T.apis, lang)} · {say(swap.source === "live" ? T.liveNote : T.demoNote, lang)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
