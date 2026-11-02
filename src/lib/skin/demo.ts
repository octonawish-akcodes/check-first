import recorded from "./demo-skin.json";
import { normalizeSkin, type SkinReading } from "./normalize";

export const DEMO_FACE = "/demo/face.jpg";

/** A real YouCam result, recorded by a live call, so the app works with no key and no units. */
export function demoReading(): SkinReading {
  return normalizeSkin(recorded.output, "demo", `${recorded.recorded}T00:00:00.000Z`);
}
