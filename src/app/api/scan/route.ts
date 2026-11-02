import { startSkinAnalysis, unitsLeft, uploadPhoto, YouCamError } from "@/lib/youcam/client";

// Starts a live YouCam skin analysis, or tells the browser to use the recorded demo.
// The photo goes to YouCam only; it is not stored here.

const MAX_BYTES = 3_000_000;
const PER_IP_PER_DAY = Number(process.env.SCANS_PER_IP_PER_DAY ?? 5);
const UNIT_FLOOR = Number(process.env.YOUCAM_UNIT_FLOOR ?? 150);
const seen = new Map<string, { day: string; n: number }>(); // best effort, per server instance

const demo = (reason: string) => Response.json({ mode: "demo", reason });

export async function POST(req: Request) {
  if (process.env.YOUCAM_LIVE === "0" || !process.env.YOUCAM_API_KEY) return demo("live_off");
  const type = req.headers.get("content-type") ?? "";
  if (type !== "image/jpeg" && type !== "image/png") return Response.json({ error: "Send a JPEG or PNG photo." }, { status: 415 });
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_BYTES) return Response.json({ error: "The photo must be under 3 MB." }, { status: 413 });

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const mine = seen.get(ip);
  const n = mine?.day === day ? mine.n : 0;
  if (n >= PER_IP_PER_DAY) return demo("daily_limit");

  try {
    if ((await unitsLeft()) < UNIT_FLOOR) return demo("units_low");
    const fileId = await uploadPhoto(bytes, type);
    const taskId = await startSkinAnalysis(fileId);
    seen.set(ip, { day, n: n + 1 });
    return Response.json({ mode: "live", taskId, fileId });
  } catch (e) {
    console.error("scan start failed", e instanceof YouCamError ? e.code : e);
    return demo("live_failed");
  }
}
