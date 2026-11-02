import { getSkinAnalysis, YouCamError } from "@/lib/youcam/client";
import { normalizeSkin } from "@/lib/skin/normalize";

// One status check for a live scan. The browser polls this every 2 seconds.
export async function GET(_req: Request, ctx: RouteContext<"/api/scan/[id]">) {
  const { id } = await ctx.params;
  try {
    const task = await getSkinAnalysis(id);
    if (task.status === "running") return Response.json({ status: "running" });
    if (task.status === "error") return Response.json({ status: "error", code: task.code });
    return Response.json({ status: "success", reading: normalizeSkin(task.output, "live") });
  } catch (e) {
    const code = e instanceof YouCamError ? e.code : "unknown";
    return Response.json({ status: "error", code }, { status: code === "bad_id" ? 400 : 502 });
  }
}
