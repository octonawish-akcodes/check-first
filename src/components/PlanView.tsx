"use client";
import { CONCERN_LABEL, PATCH_TEST, SIGN_LABEL, type Plan, type WarningSign } from "@/lib/care/plan";
import { say, UI, type Lang } from "@/lib/copy";
import type { Checked } from "./LabelCheck";
import type { Scan } from "./SkinScan";

// Stores for the shopper's region: India gets Amazon India and Nykaa, everyone else Amazon.
const inIndia = () => typeof navigator !== "undefined" && navigator.languages.some((l) => /-IN$/i.test(l));
export const shops = () =>
  inIndia()
    ? [
        { name: "Amazon", url: (q: string) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}` },
        { name: "Nykaa", url: (q: string) => `https://www.nykaa.com/search/result/?q=${encodeURIComponent(q)}` },
      ]
    : [{ name: "Amazon", url: (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}` }];

const T = {
  title: { en: "What to do next", hi: "आगे क्या करें" },
  basedOn: { en: "Based on what you want and where your skin scored lowest:", hi: "आप क्या चाहते हैं और आपकी त्वचा कहाँ सबसे कम रही, उसके आधार पर:" },
  lookFor: { en: "Look for on the label", hi: "लेबल पर देखें" },
  shop: { en: "Shop", hi: "खरीदें" },
  checkFirst: { en: "Check its label here before you buy", hi: "खरीदने से पहले यहाँ इसका लेबल जाँचें" },
  doctorH: { en: "See a skin doctor", hi: "त्वचा रोग विशेषज्ञ से मिलें" },
  card: { en: "Card for your doctor", hi: "डॉक्टर के लिए कार्ड" },
  cardWhy: { en: "Show this at your appointment so nothing gets missed.", hi: "अपॉइंटमेंट पर यह दिखाएँ ताकि कुछ छूटे नहीं।" },
  print: { en: "Print or save as PDF", hi: "प्रिंट करें या PDF सेव करें" },
  whatsapp: { en: "Share the card", hi: "कार्ड शेयर करें" },
  cream: { en: "Cream checked", hi: "जाँची गई क्रीम" },
  using: { en: "Using it for", hi: "कितने समय से लगा रहे हैं" },
  signs: { en: "Signs noticed", hi: "दिखे लक्षण" },
  scan: { en: "Skin scan (YouCam), lowest areas", hi: "त्वचा स्कैन (YouCam), सबसे कम क्षेत्र" },
  ask: { en: "Questions to ask", hi: "पूछने के लिए सवाल" },
  q1: { en: "Is this cream right for my skin?", hi: "क्या यह क्रीम मेरी त्वचा के लिए सही है?" },
  q2: { en: "If I should stop, how do I stop safely?", hi: "अगर बंद करनी है, तो सुरक्षित तरीके से कैसे बंद करूँ?" },
  q3: { en: "What can I use instead for my concern?", hi: "मेरी समस्या के लिए इसकी जगह क्या इस्तेमाल करूँ?" },
  none: { en: "none", hi: "कोई नहीं" },
};

export const DURATIONS = {
  no: { en: "Not using it", hi: "इस्तेमाल नहीं कर रहे" },
  lt1: { en: "Less than a month", hi: "एक महीने से कम" },
  m1to6: { en: "1 to 6 months", hi: "1 से 6 महीने" },
  gt6: { en: "More than 6 months", hi: "6 महीने से ज़्यादा" },
} as const;
export type Duration = keyof typeof DURATIONS;

export function PlanView(props: {
  lang: Lang;
  plan: Plan;
  checked: Checked | null;
  scan: Scan | null;
  signs: WarningSign[];
  duration: Duration;
  onCheckAnother: () => void;
}) {
  const { lang, plan, checked, scan, signs, duration } = props;
  const flagged = checked?.result.findings.filter((f) => f.match === "exact") ?? [];
  const cardLines = [
    `${say(T.cream, lang)}: ${flagged.length ? flagged.map((f) => `${f.rule.name}${f.strength ? ` ${f.strength}` : ""}`).join(", ") : say(T.none, lang)}`,
    `${say(T.using, lang)}: ${say(DURATIONS[duration], lang)}`,
    `${say(T.signs, lang)}: ${signs.length ? signs.map((s) => say(SIGN_LABEL[s], lang)).join("; ") : say(T.none, lang)}`,
    ...(scan ? [`${say(T.scan, lang)}: ${scan.reading.scores.slice(0, 3).map((s) => `${say(CONCERN_LABEL[s.concern], lang)} ${s.raw.toFixed(0)}`).join(", ")}`] : []),
  ];
  const share = `Check First, ${new Date().toLocaleDateString()}\n${cardLines.join("\n")}\n\n${say(T.ask, lang)}:\n1. ${say(T.q1, lang)}\n2. ${say(T.q2, lang)}\n3. ${say(T.q3, lang)}`;

  return (
    <div className="grid gap-6">
      <section aria-labelledby="plan-h" className="appear rounded-xl border border-line bg-card p-5 sm:p-6">
        <h2 id="plan-h" className="font-display text-3xl font-bold leading-tight">{say(T.title, lang)}</h2>
        <p className="mt-1 text-muted">
          {say(T.basedOn, lang)} <span className="font-semibold text-ink">{plan.focus.map((c) => say(CONCERN_LABEL[c], lang)).join(", ")}</span>.
        </p>
        {plan.note && <p className="mt-4 max-w-prose rounded-lg bg-counter px-4 py-3 font-semibold">{say(plan.note, lang)}</p>}
        <ol className="mt-5 grid gap-3">
          {plan.steps.map((s, i) => (
            <li key={s.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-t border-line pt-4">
              <span className="font-display text-3xl font-bold leading-none text-rx">{i + 1}</span>
              <div>
                <h3 className="font-display text-2xl font-bold leading-tight">{say(s.title, lang)}</h3>
                <p className="mt-1 max-w-prose">{say(s.why, lang)}</p>
                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="text-muted">{say(T.lookFor, lang)}:</span>
                  {s.lookFor.map((w) => (
                    <span key={w} className="rounded border border-ok/40 bg-ok-soft px-2 py-0.5 font-semibold text-ok">{w}</span>
                  ))}
                </p>
                <div className="no-print mt-3 flex flex-wrap items-center gap-2 text-sm">
                  {shops().map((shop) => (
                    <a key={shop.name} href={shop.url(s.search)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center rounded-full border-2 border-ink px-3 font-semibold hover:bg-ink hover:text-white">
                      {say(T.shop, lang)} · {shop.name}
                    </a>
                  ))}
                  <button type="button" onClick={props.onCheckAnother} className="ml-1 font-semibold text-rx underline underline-offset-2">
                    {say(T.checkFirst, lang)}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-line pt-3 text-sm text-muted">{say(PATCH_TEST, lang)}</p>
      </section>

      {plan.doctor.length > 0 && (
        <section aria-labelledby="doc-h" className="appear overflow-hidden border-2 border-rx bg-card">
          <h2 id="doc-h" className="bg-rx px-5 py-3 font-display text-3xl font-bold leading-tight text-white">{say(T.doctorH, lang)}</h2>
          <div className="px-5 pb-5">
            {plan.doctor.map((d, i) => (
              <p key={i} className="mt-3 max-w-prose leading-relaxed">{say(d, lang)}</p>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="card-h" className="rx-pad relative border-2 border-ink py-5 pl-8 pr-5 shadow-[6px_6px_0_var(--ink)] sm:py-7 sm:pl-10 sm:pr-7">
        <div className="flex items-start justify-between gap-4 border-b-2 border-ink pb-3">
          <div>
            <h2 id="card-h" className="font-display text-3xl font-bold leading-tight">{say(T.card, lang)}</h2>
            <p className="no-print text-muted">{say(T.cardWhy, lang)}</p>
          </div>
          <span aria-hidden className="grid size-12 shrink-0 place-items-center border-2 border-rx font-display text-2xl font-bold text-rx">Rx</span>
        </div>
        <p className="mt-2 text-sm text-muted">Check First · {new Date().toLocaleDateString()}</p>
        <dl className="mt-2">
          {cardLines.map((l) => {
            const at = l.indexOf(": ");
            return (
              <div key={l} className="grid gap-x-4 border-b border-dotted border-ink/30 py-2 sm:grid-cols-[11rem_1fr]">
                <dt className="text-sm text-muted">{l.slice(0, at)}</dt>
                <dd className="font-semibold">{l.slice(at + 2)}</dd>
              </div>
            );
          })}
        </dl>
        <p className="mt-4 font-semibold">{say(T.ask, lang)}</p>
        <ol className="mt-1 grid list-decimal gap-1 pl-6">
          <li>{say(T.q1, lang)}</li>
          <li>{say(T.q2, lang)}</li>
          <li>{say(T.q3, lang)}</li>
        </ol>
        <p className="print-only mt-4 text-xs">{say(UI.notAdvice, lang)}</p>
        <div className="no-print mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => window.print()} className="min-h-12 flex-1 rounded-lg bg-ink px-4 font-semibold text-white hover:brightness-125">
            {say(T.print, lang)}
          </button>
          <button
            type="button"
            onClick={async () => {
              // The phone's own share sheet (WhatsApp included): the card never goes into a link or to our server.
              if (navigator.share) await navigator.share({ text: share }).catch(() => {});
              else await navigator.clipboard.writeText(share);
            }}
            className="min-h-12 flex-1 rounded-lg border-2 border-ink bg-card px-4 font-semibold hover:bg-paper"
          >
            {say(T.whatsapp, lang)}
          </button>
        </div>
      </section>
    </div>
  );
}
