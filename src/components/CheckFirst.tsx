"use client";
import { useEffect, useState, type ReactNode } from "react";
import { GOAL_LABEL, GOALS, makePlan, SIGN_LABEL, WARNING_SIGNS, type Goal, type WarningSign } from "@/lib/care/plan";
import { say, UI, type Lang } from "@/lib/copy";
import { Landing, Nav, POWERED_BY } from "./Landing";
import { LabelResult, type Checked } from "./LabelCheck";
import { DURATIONS, PlanView, type Duration } from "./PlanView";
import { SafeSwap } from "./SafeSwap";
import { SkinScan, type Scan } from "./SkinScan";

const T = {
  aboutYou: { en: "About you and this cream", hi: "आप और यह क्रीम" },
  goal: { en: "What do you want the cream for?", hi: "आप क्रीम किस लिए चाहते हैं?" },
  using: { en: "Are you already using it?", hi: "क्या आप इसे पहले से लगा रहे हैं?" },
  signs: { en: "Have you noticed any of these? Tick all that apply.", hi: "क्या आपने इनमें से कुछ देखा है? जो लागू हों, सब चुनें।" },
  showPlan: { en: "Show my next steps", hi: "मेरे अगले कदम दिखाएँ" },
};

/** One step on the rail: a numbered dot on the left, the step's content on the right. */
function Step({ n, children, id }: { n: number; children: ReactNode; id?: string }) {
  return (
    <li id={id} className="rail-step appear scroll-mt-24">
      <span aria-hidden className="rail-dot z-10 grid size-9 place-items-center rounded-full border-2 border-ink bg-paper font-display text-lg font-bold sm:size-11 sm:text-xl">
        {n}
      </span>
      <div className="min-w-0">{children}</div>
    </li>
  );
}

export function CheckFirst() {
  const [lang, setLang] = useState<Lang>("en");
  const [checked, setChecked] = useState<Checked | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [duration, setDuration] = useState<Duration>("no");
  const [signs, setSigns] = useState<WarningSign[]>([]);
  const [scan, setScan] = useState<Scan | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  // Reveal each [data-reveal] block once it scrolls into view; re-run when the page swaps views.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])");
    if (!("IntersectionObserver" in window)) return els.forEach((el) => el.setAttribute("data-in", ""));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [checked, lang]);

  const flagged = checked !== null && ["steroid", "mercury", "medicine"].includes(checked.result.verdict);
  const plan = goal ? makePlan({ goal, reading: scan?.reading, usingFlagged: flagged && duration !== "no", signs }) : null;

  const onChecked = (c: Checked) => {
    setChecked(c);
    requestAnimationFrame(() => document.getElementById("step-label")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const checkAnother = () => {
    setChecked(null);
    requestAnimationFrame(() => document.getElementById("check")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const chip = (on: boolean) =>
    `min-h-11 rounded-full border-2 px-4 text-left font-semibold transition-colors ${on ? "border-ink bg-ink text-white" : "border-line bg-card hover:border-ink"}`;

  return (
    <div lang={lang} id="top">
      <Nav lang={lang} setLang={setLang} />
      {!checked && <Landing lang={lang} onChecked={onChecked} />}

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {checked && (
          <ol className="mx-auto grid max-w-3xl gap-10 py-12">
            <Step n={1} id="step-label">
              <div className="no-print grid gap-3">
                <LabelResult checked={checked} lang={lang} />
                <button type="button" onClick={checkAnother} className="justify-self-start font-semibold underline underline-offset-4">
                  {say(UI.checkAnother, lang)}
                </button>
              </div>
            </Step>

            <Step n={2}>
              <section aria-labelledby="you-h" className="no-print rounded-xl border border-line bg-card p-5 sm:p-6">
                <h2 id="you-h" className="font-display text-3xl font-bold leading-tight">{say(T.aboutYou, lang)}</h2>
                <fieldset className="mt-4">
                  <legend className="font-semibold">{say(T.goal, lang)}</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {GOALS.map((g) => (
                      <button key={g} type="button" aria-pressed={goal === g} onClick={() => setGoal(g)} className={chip(goal === g)}>
                        {say(GOAL_LABEL[g], lang)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-5">
                  <legend className="font-semibold">{say(T.using, lang)}</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Object.keys(DURATIONS) as Duration[]).map((d) => (
                      <button key={d} type="button" aria-pressed={duration === d} onClick={() => setDuration(d)} className={chip(duration === d)}>
                        {say(DURATIONS[d], lang)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                {duration !== "no" && (
                  <fieldset className="appear mt-5">
                    <legend className="font-semibold">{say(T.signs, lang)}</legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {WARNING_SIGNS.map((s) => (
                        <label key={s} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2 has-checked:border-rx has-checked:bg-rx-soft">
                          <input
                            type="checkbox"
                            className="size-5 shrink-0 accent-rx"
                            checked={signs.includes(s)}
                            onChange={(e) => setSigns((cur) => (e.target.checked ? [...cur, s] : cur.filter((x) => x !== s)))}
                          />
                          {say(SIGN_LABEL[s], lang)}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </section>
            </Step>

            {goal && (
              <Step n={3}>
                <div className="no-print">
                  <SkinScan lang={lang} scan={scan} onScan={setScan} />
                  {scan && (
                    <div className="mt-6">
                      <SafeSwap key={scan.photo} lang={lang} scan={scan} />
                    </div>
                  )}
                </div>
              </Step>
            )}

            {goal && (
              <Step n={4}>
                {showPlan && plan ? (
                  <PlanView lang={lang} plan={plan} checked={checked} scan={scan} signs={duration === "no" ? [] : signs} duration={duration} onCheckAnother={checkAnother} />
                ) : (
                  <button type="button" onClick={() => setShowPlan(true)} className="no-print min-h-14 w-full rounded-xl bg-rx px-5 text-lg font-semibold text-white hover:brightness-110 sm:w-auto">
                    {say(T.showPlan, lang)}
                  </button>
                )}
              </Step>
            )}
          </ol>
        )}

        <footer className="grid gap-2 border-t border-line py-8 text-sm text-muted sm:grid-cols-[1fr_auto] sm:gap-8">
          <p className="max-w-2xl">{say(UI.notAdvice, lang)}</p>
          <p>{say(POWERED_BY, lang)}</p>
        </footer>
      </div>
    </div>
  );
}
