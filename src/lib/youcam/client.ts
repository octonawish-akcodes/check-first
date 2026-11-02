import "server-only";
// The YouCam (Perfect Corp) S2S client. Server only: the API key never reaches the browser.
// Wire format checked by a live call on 1 Nov 2026 (scripts/probe-skin.mjs).

const API = process.env.YOUCAM_API_BASE ?? "https://yce-api-01.makeupar.com";
const SKIN = "/s2s/v2.1/task/skin-analysis";

/** SD concerns we score. 8 concerns + skin type costs 14 units (live, 1 Nov). */
export const ACTIONS = ["acne", "age_spot", "redness", "texture", "oiliness", "moisture", "radiance", "pore", "skin_type"] as const;

export class YouCamError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
  }
}

function key() {
  const k = process.env.YOUCAM_API_KEY;
  if (!k) throw new YouCamError("no_key", "YOUCAM_API_KEY is not set");
  return k;
}

async function call(path: string, init: { method: "GET" | "POST"; body?: unknown }) {
  const res = await fetch(API + path, {
    method: init.method,
    headers: { Authorization: `Bearer ${key()}`, ...(init.body ? { "Content-Type": "application/json" } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) {
    const code = String(json?.error_code ?? json?.error ?? `http_${res.status}`);
    throw new YouCamError(res.status === 401 || res.status === 403 ? "auth" : code, `${path} returned ${res.status} ${code}`);
  }
  return json ?? {};
}

/** Units left across all pots. Free to call. */
export async function unitsLeft(): Promise<number> {
  const j = (await call("/s2s/v1.0/client/credit", { method: "GET" })) as { results?: { amount?: number }[] };
  return (j.results ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
}

/** Registers the photo, PUTs it to the pre-signed URL YouCam returns, and returns the file id. */
export async function uploadPhoto(bytes: Uint8Array, contentType: string): Promise<string> {
  const j = (await call("/s2s/v2.0/file", {
    method: "POST",
    body: { files: [{ content_type: contentType, file_name: `scan.${contentType === "image/png" ? "png" : "jpg"}`, file_size: bytes.length }] },
  })) as { data?: { files?: { file_id: string; requests: { url: string; method?: string; headers?: Record<string, string | number> }[] }[] } };
  const file = j.data?.files?.[0];
  const target = file?.requests?.[0];
  if (!file || !target) throw new YouCamError("protocol", "file upload slot missing");
  const headers = Object.fromEntries(Object.entries(target.headers ?? { "Content-Type": contentType }).map(([k, v]) => [k, String(v)]));
  const put = await fetch(target.url, { method: target.method ?? "PUT", headers, body: bytes as BodyInit, signal: AbortSignal.timeout(30_000) });
  if (!put.ok) throw new YouCamError("upload", `photo upload returned ${put.status}`);
  return file.file_id;
}

/** Starts an SD skin analysis. Units are charged only if it succeeds. */
export async function startSkinAnalysis(fileId: string): Promise<string> {
  const j = (await call(SKIN, {
    method: "POST",
    body: { src_file_id: fileId, dst_actions: ACTIONS, miniserver_args: { enable_mask_overlay: false }, format: "json" },
  })) as { data?: { task_id?: string } };
  if (!j.data?.task_id) throw new YouCamError("protocol", "no task id");
  return j.data.task_id;
}

export type RawTask = { status: "running" } | { status: "success"; output: unknown[] } | { status: "error"; code: string };

export async function getSkinAnalysis(taskId: string): Promise<RawTask> {
  if (!/^[\w-]{6,128}$/.test(taskId)) throw new YouCamError("bad_id", "bad task id");
  const j = (await call(`${SKIN}/${taskId}`, { method: "GET" })) as { data?: { task_status?: string; results?: { output?: unknown[] }; error?: string } };
  const st = j.data?.task_status;
  if (st === "success") return { status: "success", output: j.data?.results?.output ?? [] };
  if (st === "error" || st === "failed") return { status: "error", code: String(j.data?.error ?? "error") };
  return { status: "running" };
}

/** Starts any v2.0 task (skin tone, makeup try-on) and polls it to the end, within the request. */
async function runTask(task: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const j = (await call(`/s2s/v2.0/task/${task}`, { method: "POST", body })) as { data?: { task_id?: string } };
  const id = j.data?.task_id;
  if (!id) throw new YouCamError("protocol", "no task id");
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const g = (await call(`/s2s/v2.0/task/${task}/${id}`, { method: "GET" })) as { data?: { task_status?: string; results?: Record<string, unknown>; error?: string } };
    const st = g.data?.task_status;
    if (st === "success") return g.data?.results ?? {};
    if (st === "error" || st === "failed") throw new YouCamError(String(g.data?.error ?? "error"), `${task} failed`);
  }
  throw new YouCamError("timeout", `${task} timed out`);
}

export type ToneSwap = { skin: string; eye: string; hair: string; after: string };

/** Skin Tone Analysis (20 units), then a Makeup VTO foundation in that exact shade (1 unit), on one uploaded photo. */
export async function toneSwap(fileId: string): Promise<ToneSwap> {
  if (!/^[\w./=+-]{6,512}$/.test(fileId)) throw new YouCamError("bad_id", "bad file id");
  const tone = (await runTask("skin-tone-analysis", { src_file_id: fileId, face_angle_strictness_level: "flexible" })) as {
    color?: { skin_color?: string; eye_color_name?: string; hair_color_name?: string };
  };
  const skin = tone.color?.skin_color;
  if (!skin || !/^#[0-9a-f]{6}$/i.test(skin)) throw new YouCamError("protocol", "no skin colour");
  const vto = (await runTask("makeup-vto", {
    src_file_id: fileId,
    version: "1.0",
    effects: [
      { category: "skin_smooth", skinSmoothStrength: 0, skinSmoothColorIntensity: 0 },
      { category: "foundation", palettes: [{ color: skin, colorIntensity: 40, coverageIntensity: 60, glowIntensity: 20 }] },
    ],
  })) as { url?: string } | { url?: string; download_url?: string }[];
  const after = Array.isArray(vto) ? (vto[0]?.url ?? vto[0]?.download_url) : vto.url;
  if (!after) throw new YouCamError("protocol", "no try-on image");
  return { skin, eye: tone.color?.eye_color_name ?? "", hair: tone.color?.hair_color_name ?? "", after };
}
