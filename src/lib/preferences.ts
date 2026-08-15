import { getPreferenceValues } from "@vicinae/api";

/**
 * Preferences declared in the extension manifest (package.json).
 * Dropdown values arrive as strings; the App ID as a string.
 */
export type WolframPreferences = {
  appid: string;
  defaultView: string;
  gridColumns: string;
};

export function getWolframPreferences(): WolframPreferences {
  return getPreferenceValues<WolframPreferences>();
}

const num = (v: string | undefined, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export function gridColumns(prefs: WolframPreferences = getWolframPreferences()): number {
  return num(prefs.gridColumns, 4);
}

export function defaultView(
  prefs: WolframPreferences = getWolframPreferences(),
): "list" | "grid" {
  return prefs.defaultView === "grid" ? "grid" : "list";
}
