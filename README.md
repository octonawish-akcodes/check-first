# Check First

**Is there a steroid in your face cream?** Check First reads a face cream's label on your phone and circles every steroid, mercury salt and medicine in it. Then it uses three YouCam AI APIs to show what your skin actually needs, and a safe product to use instead.

Built for the [YouCam API Skin AI & eCommerce VTO Hackathon](https://youcam-api-skin-ai-ecommerce.devpost.com/).

## Why

- More than 1 in 4 people have used a skin-lightening product, across 68 studies in Africa, Asia, Europe, the Middle East and North America ([World Congress of Dermatology 2023](https://www.mdedge.com/content/can-skin-bleaching-lead-cancer)).
- Mercury is banned in cosmetics under the Minamata Convention, yet the WHO says mercury creams still reach people online and in markets ([WHO](https://www.who.int/initiatives/elimination-of-mercury-containing-skin-lightening-products)).
- In India, 14 topical steroids have needed a prescription since March 2018, yet "fairness" and pimple creams with clobetasol or betamethasone are still sold over the counter.

## What it does

1. **Read the label.** Photograph the ingredients panel or type it in. Tesseract reads it in the browser; the label photo never leaves the phone. Check First finds 23 topical steroids, mercury salts, hydroquinone, retinoids, and antibiotics or antifungals mixed with a steroid, with the strength printed next to each.
2. **Tell you plainly.** A verdict in English or Hindi: what the medicine is, why it isn't a beauty cream, India's prescription rule when it applies, and "don't stop suddenly, see a dermatologist" when you've been using it.
3. **Scan your skin (YouCam AI Skin Analysis).** One selfie, eight scores (acne, spots, redness, texture, pores, oiliness, moisture, glow) and YouCam's mask showing where on the face each one is.
4. **The safe swap (YouCam Skin Tone Analysis + Makeup Virtual Try-On).** YouCam reads your real skin colour, then tries a foundation in that exact shade on your face, with a before/after slider. Even-looking skin today, no bleach, and links to shop that shade.
5. **Next steps and a doctor card.** Safer cosmetic steps for your goal and lowest scores, what to look for on a label, and a printable card for your dermatologist.

## YouCam APIs used

| API | Endpoint | Where |
|---|---|---|
| AI Skin Analysis (SD) | `/s2s/v2.1/task/skin-analysis` | `src/lib/youcam/client.ts`, `src/app/api/scan` |
| AI Skin Tone Analysis | `/s2s/v2.0/task/skin-tone-analysis` | `toneSwap()` in `src/lib/youcam/client.ts`, `src/app/api/swap` |
| AI Makeup Virtual Try-On (foundation) | `/s2s/v2.0/task/makeup-vto` | `toneSwap()`, chained on the same uploaded photo |
| File API | `/s2s/v2.0/file` | one upload serves all three tasks |

The key stays on the server. The selfie is sent to YouCam only after the user ticks consent; Check First stores nothing. Scores shown are YouCam's `raw_score`, not the inflated `ui_score`.

## Try it (for judges)

- **Live:** see the Devpost submission for the deployed URL.
- **No selfie needed:** press **See an example** in the hero, pick a goal, then **Use the sample face** and **Show it on my face**. The sample uses real YouCam results recorded on 1 and 2 Nov 2026, so it costs no units.
- **Live YouCam:** take a selfie instead of the sample face (front-facing, even light).

## Run locally

```bash
pnpm install
cp .env.example .env.local   # add your YouCam API key
pnpm dev                     # http://localhost:3000
pnpm test                    # 20 tests: label rules and care plan
```

Without a key the app runs fully on the recorded sample results.

## Stack

Next.js 16, React 19, Tailwind CSS 4, tesseract.js (on-device OCR), Vitest. Label rules: `src/lib/check/rules.ts`. All advice text is written by hand in `src/lib/copy.ts` and `src/lib/care/plan.ts`; no AI writes medical text at runtime.

## Not medical advice

Check First reads labels and gives general skin-care information. It cannot diagnose. See a dermatologist for any skin problem.

## Licence

MIT
