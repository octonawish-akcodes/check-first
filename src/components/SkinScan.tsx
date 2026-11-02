"use client";
import { useState } from "react";
import { CONCERN_LABEL } from "@/lib/care/plan";
import { say, type Lang } from "@/lib/copy";
import { DEMO_FACE, demoReading } from "@/lib/skin/demo";
import type { SkinReading } from "@/lib/skin/normalize";

export type Scan = { reading: SkinReading; photo: string; fileId?: string };

/** Shrinks the selfie in the browser (long side 1280 px) so the upload is small and quick. */
async function shrink(file: File): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error("encode"))), "image/jpeg", 0.9));
}

const T = {
  title: { en: "Scan your skin", hi: "अपनी त्वचा स्कैन करें" },
  why: {
    en: "YouCam's skin AI scores eight areas from one selfie, so the next steps fit your skin, not the cream's advert.",
    hi: "YouCam का स्किन AI एक सेल्फ़ी से आठ चीज़ें मापता है, ताकि अगले कदम आपकी त्वचा के हिसाब से हों, क्रीम के विज्ञापन के हिसाब से नहीं।",
  },
  consent: {
    en: "I agree to send this selfie to YouCam (Perfect Corp) for skin analysis. Check First doesn't store it.",
    hi: "मैं इस सेल्फ़ी को त्वचा विश्लेषण के लिए YouCam (Perfect Corp) को भेजने के लिए सहमत हूँ। Check First इसे सेव नहीं करता।",
  },
  selfie: { en: "Take a selfie", hi: "सेल्फ़ी लें" },
  demo: { en: "Use the sample face", hi: "नमूना चेहरा इस्तेमाल करें" },
  howTo: { en: "Face the camera, no glasses, even daylight, plain background.", hi: "कैमरे की ओर सीधे देखें, चश्मा नहीं, एक-सी रोशनी, सादा बैकग्राउंड।" },
  scanning: { en: "YouCam is reading your skin…", hi: "YouCam आपकी त्वचा पढ़ रहा है…" },
  failed: {
    en: "YouCam couldn't read that photo. Try again facing the camera in even light.",
    hi: "YouCam वह फ़ोटो नहीं पढ़ पाया। एक-सी रोशनी में कैमरे की ओर सीधे देखकर फिर कोशिश करें।",
  },
  demoNote: {
    en: "Sample: a real YouCam result recorded on 1 Nov 2026 from YouCam's sample photo.",
    hi: "नमूना: YouCam की नमूना फ़ोटो पर 1 नवंबर 2026 को रिकॉर्ड किया गया असली YouCam परिणाम।",
  },
  liveNote: { en: "Live YouCam result for your photo.", hi: "आपकी फ़ोटो का लाइव YouCam परिणाम।" },
  fellBack: {
    en: "Live scans are paused right now, so this is the recorded sample.",
    hi: "अभी लाइव स्कैन रुके हुए हैं, इसलिए यह रिकॉर्ड किया गया नमूना है।",
  },
  lowest: { en: "Where your skin scored lowest", hi: "आपकी त्वचा कहाँ सबसे कम रही" },
  tapHint: { en: "Tap a score to see where YouCam found it on the face.", hi: "चेहरे पर YouCam ने इसे कहाँ पाया, यह देखने के लिए किसी स्कोर पर टैप करें।" },
  scale: { en: "YouCam's raw score, 0–100, higher is healthier.", hi: "YouCam का असली स्कोर, 0–100, जितना ज़्यादा उतना बेहतर।" },
};

const SPOT_MASKS = new Set(["acne", "age_spot", "redness", "pore", "texture"]);

export function SkinScan({ lang, scan, onScan }: { lang: Lang; scan: Scan | null; onScan: (s: Scan) => void }) {
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fellBack, setFellBack] = useState(false);
  const [maskOf, setMaskOf] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const showDemo = (fallback = false) => {
    setFellBack(fallback);
    onScan({ reading: demoReading(), photo: DEMO_FACE });
  };

  async function onSelfie(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await shrink(file);
      setPreview(URL.createObjectURL(blob));
      const start = await (await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: blob })).json();
      if (start.mode !== "live") return showDemo(true);
      for (let i = 0; i < 45; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const s = await (await fetch(`/api/scan/${encodeURIComponent(start.taskId)}`)).json();
        if (s.status === "success") return onScan({ reading: s.reading, photo: URL.createObjectURL(blob), fileId: start.fileId });
        if (s.status === "error") throw new Error(s.code);
      }
      throw new Error("timeout");
    } catch {
      setError(say(T.failed, lang));
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  const top = scan?.reading.scores.slice(0, 3) ?? [];
  // Spot masks mark small areas; moisture, glow and oiliness tint the whole face, so they wait for a tap.
  const shown = maskOf ?? top.find((s) => SPOT_MASKS.has(s.concern))?.concern ?? null;
  const mask = top.find((s) => s.concern === shown)?.mask;

  return (
    <section aria-labelledby="scan-h" className="rounded-xl border border-line bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="scan-h" className="font-display text-3xl font-bold leading-tight">{say(T.title, lang)}</h2>
        <p className="text-sm font-semibold text-muted">YouCam Skin AI</p>
      </div>
      <p className="mt-1 max-w-prose text-muted">{say(T.why, lang)}</p>
      {!scan && (
        <div className="mt-5 grid gap-5 sm:grid-cols-[9rem_1fr] sm:items-start">
          <div className="relative mx-auto aspect-[3/4] w-36 overflow-hidden rounded-[45%] border-2 border-dashed border-ink/50 bg-paper sm:w-full" aria-hidden>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- the selfie being scanned, a local blob
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <svg viewBox="0 0 60 80" className="absolute inset-0 m-auto w-2/3 text-line">
                <ellipse cx="30" cy="32" rx="17" ry="22" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M6 80 C8 62 18 56 30 56 C42 56 52 62 54 80" fill="none" stroke="currentColor" strokeWidth="2.5" />
              </svg>
            )}
            {busy && <span className="scan-line absolute inset-x-0 top-1/2 h-0.5 bg-rx shadow-[0_0_12px_2px_var(--rx)]" />}
          </div>
          <div>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 has-checked:border-ink">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-ink" />
              <span className="text-sm">{say(T.consent, lang)}</span>
            </label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className={`grid min-h-12 flex-1 place-items-center rounded-lg px-4 text-center font-semibold ${agree && !busy ? "cursor-pointer bg-ink text-white hover:brightness-125" : "pointer-events-none bg-line text-muted"}`}>
                {busy ? say(T.scanning, lang) : say(T.selfie, lang)}
                <input type="file" accept="image/jpeg,image/png" capture="user" className="sr-only" disabled={!agree || busy} onChange={(e) => onSelfie(e.target.files?.[0])} />
              </label>
              <button type="button" onClick={() => showDemo()} disabled={busy} className="min-h-12 flex-1 rounded-lg border-2 border-ink px-4 font-semibold hover:bg-paper">
                {say(T.demo, lang)}
              </button>
            </div>
            <p className="mt-2 text-sm text-muted">{say(T.howTo, lang)}</p>
            {error && <p role="alert" className="mt-2 text-sm font-semibold text-rx">{error}</p>}
          </div>
        </div>
      )}
      {scan && (
        <div className="appear mt-5 grid gap-5 sm:grid-cols-[15rem_1fr]">
          <div className="relative mx-auto w-56 self-start overflow-hidden rounded-lg border-2 border-ink sm:w-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- a local blob or a recorded sample */}
            <img src={scan.photo} alt="" className="block w-full" />
            {mask && (
              // eslint-disable-next-line @next/next/no-img-element -- YouCam's mask for the selected concern
              <img src={mask} alt="" className="absolute inset-0 h-full w-full opacity-40" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{say(T.lowest, lang)}</h3>
            <p className="text-sm text-muted">{say(T.tapHint, lang)}</p>
            <ul className="mt-3 grid gap-2">
              {top.map((s) => {
                const on = shown === s.concern;
                return (
                  <li key={s.concern}>
                    <button
                      type="button"
                      onClick={() => setMaskOf(s.concern)}
                      aria-pressed={on}
                      className={`w-full rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${on ? "border-ink bg-paper" : "border-line hover:border-ink/60"}`}
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="flex-1 font-semibold">{say(CONCERN_LABEL[s.concern], lang)}</span>
                        <span className="font-display text-2xl font-bold tabular-nums leading-none">{s.raw.toFixed(0)}</span>
                      </span>
                      <span className="mt-2 block h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                        <span className="block h-full rounded-full bg-ink" style={{ width: `${Math.max(3, Math.min(100, s.raw))}%` }} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted">{say(T.scale, lang)}</p>
            <p className="mt-1 text-xs text-muted">
              {say(scan.reading.source === "live" ? T.liveNote : fellBack ? T.fellBack : T.demoNote, lang)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
