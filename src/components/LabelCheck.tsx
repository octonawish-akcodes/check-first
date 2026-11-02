"use client";
import { useRef, useState } from "react";
import { checkLabel, type CheckResult } from "@/lib/check/check";
import { highlight } from "@/lib/check/highlight";
import { say, UI, verdictCopy, type Lang } from "@/lib/copy";

export const SAMPLES = [
  {
    id: "combo",
    label: { en: "Combination cream", hi: "मिश्रित क्रीम" },
    text: "Each gram contains:\nClobetasol Propionate IP 0.05% w/w\nNeomycin Sulphate IP 0.5% w/w\nMiconazole Nitrate IP 2% w/w\nChlorocresol (as preservative) IP 0.1% w/w\nCream base q.s.",
  },
  {
    id: "triple",
    label: { en: "'Fairness' cream", hi: "'फेयरनेस' क्रीम" },
    text: "Composition:\nHydroquinone USP 2% w/w\nTretinoin USP 0.025% w/w\nMometasone Furoate IP 0.1% w/w\nCream base q.s.\nFor external use only.",
  },
  {
    id: "plain",
    label: { en: "Moisturiser", hi: "मॉइस्चराइज़र" },
    text: "Ingredients: Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Dimethicone, Ceramide NP, Panthenol, Allantoin, Phenoxyethanol, Fragrance.",
  },
] as const;

export type Checked = { text: string; result: CheckResult; source: "photo" | "typed" | "sample" };

const TONE = {
  rx: { box: "border-rx", band: "bg-rx" },
  warn: { box: "border-warn", band: "bg-warn" },
  ok: { box: "border-ok", band: "bg-ok" },
} as const;

/** Reads the label on the device with Tesseract. The photo never leaves the phone. */
async function readPhoto(file: File, onProgress: (p: number) => void): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => m.status === "recognizing text" && onProgress(m.progress),
  });
  try {
    const { data } = await worker.recognize(file);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

export function LabelInput({ lang, onChecked }: { lang: Lang; onChecked: (c: Checked) => void }) {
  const [tab, setTab] = useState<"photo" | "type">("photo");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const run = (t: string, source: Checked["source"]) => onChecked({ text: t, result: checkLabel(t), source });

  async function onPhoto(f: File | undefined) {
    if (!f) return;
    setError(null);
    setBusy(0);
    try {
      const read = await readPhoto(f, setBusy);
      setText(read);
      run(read, "photo");
    } catch {
      setError(lang === "hi" ? "फ़ोटो नहीं पढ़ी जा सकी। सामग्री टाइप करके देखें।" : "Couldn't read that photo. Try typing the ingredients.");
      setTab("type");
    } finally {
      setBusy(null);
    }
  }

  const tabBtn = (id: "photo" | "type", label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={`min-h-11 flex-1 border-b-4 px-3 font-semibold ${tab === id ? "border-ink text-ink" : "border-transparent text-muted"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border-2 border-ink bg-card shadow-[6px_6px_0_var(--rx)]">
      <div role="tablist" className="flex border-b border-line">
        {tabBtn("photo", say(UI.photoTab, lang))}
        {tabBtn("type", say(UI.typeTab, lang))}
      </div>
      <div className="p-4 sm:p-5">
        {tab === "photo" ? (
          <div>
            <input ref={file} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => file.current?.click()}
              className="min-h-14 w-full rounded-sm bg-ink px-4 text-lg font-semibold text-white disabled:opacity-60"
            >
              {busy !== null ? `${say(UI.reading, lang)} ${Math.round(busy * 100)}%` : say(UI.takePhoto, lang)}
            </button>
            <p className="mt-2 text-sm text-muted">{say(UI.photoStays, lang)}</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(text, "typed");
            }}
          >
            <label htmlFor="label-text" className="sr-only">{say(UI.typeTab, lang)}</label>
            <textarea
              id="label-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder={say(UI.placeholder, lang)}
              className="w-full rounded-sm border border-line bg-paper p-3 font-mono text-[15px]"
            />
            <button type="submit" className="mt-3 min-h-12 w-full rounded-sm bg-ink px-4 font-semibold text-white">{say(UI.check, lang)}</button>
          </form>
        )}
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-rx">{error}</p>}
        <div className="mt-4">
          <p className="text-sm text-muted">{say(UI.examples, lang)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setText(s.text);
                  run(s.text, "sample");
                }}
                className="min-h-10 rounded-full border border-ink px-3 text-sm font-semibold hover:bg-paper"
              >
                {say(s.label, lang)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LabelResult({ checked, lang }: { checked: Checked; lang: Lang }) {
  const copy = verdictCopy(checked.result);
  const segs = highlight(checked.text, checked.result.findings);
  const shown = checked.result.findings.filter((f) => f.match === "exact" || checked.result.verdict === "possible");
  return (
    <section aria-live="polite" className={`appear border-2 bg-card ${TONE[copy.tone].box}`}>
      <div className={`flex items-center gap-3 px-4 py-3 text-white sm:px-5 ${TONE[copy.tone].band}`}>
        {copy.tone === "rx" && (
          <span aria-hidden className="grid size-11 shrink-0 place-items-center border-2 border-white font-display text-2xl font-bold">
            Rx
          </span>
        )}
        <h2 className="font-display text-3xl font-bold leading-[1.05] sm:text-4xl">{say(copy.title, lang)}</h2>
      </div>
      <div className="p-4 sm:p-5">
        {shown.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {shown.map((f) => (
              <li key={f.rule.id} className={`rounded-full border-2 px-3 py-0.5 font-semibold ${f.match === "exact" ? "border-rx text-rx" : "border-warn text-warn"}`}>
                {f.rule.name}
                {f.strength ? <span className="font-normal"> {f.strength}</span> : null}
              </li>
            ))}
          </ul>
        )}
        {copy.body.map((b, i) => (
          <p key={i} className={`max-w-prose leading-relaxed ${i === 0 && shown.length === 0 ? "" : "mt-3"}`}>{say(b, lang)}</p>
        ))}
      </div>
      {checked.text.trim() && (
        <details className="border-t border-line bg-paper px-4 py-3 sm:px-5" open={checked.result.findings.length > 0}>
          <summary className="cursor-pointer text-sm font-semibold">{say(UI.whatWeRead, lang)}</summary>
          <p className="mt-2 whitespace-pre-wrap font-mono text-[14px] leading-7">
            {segs.map((s, i) => (s.mark ? <mark key={i} className={s.mark}>{s.text}</mark> : <span key={i}>{s.text}</span>))}
          </p>
        </details>
      )}
    </section>
  );
}
