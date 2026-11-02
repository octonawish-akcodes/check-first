import { toneSwap, YouCamError } from "@/lib/youcam/client";

// The safe swap: YouCam reads the skin's own colour, then shows a matching foundation on the same photo.
// Reuses the file the skin scan already uploaded, so the selfie goes to YouCam once.

export const maxDuration = 60;

export async function POST(req: Request) {
  if (process.env.YOUCAM_LIVE === "0" || !process.env.YOUCAM_API_KEY) return Response.json({ mode: "demo" });
  const { fileId } = (await req.json().catch(() => ({}))) as { fileId?: string };
  if (typeof fileId !== "string") return Response.json({ error: "missing file" }, { status: 400 });
  try {
    return Response.json({ mode: "live", ...(await toneSwap(fileId)) });
  } catch (e) {
    console.error("swap failed", e instanceof YouCamError ? e.code : e);
    return Response.json({ mode: "demo", reason: "live_failed" });
  }
}
