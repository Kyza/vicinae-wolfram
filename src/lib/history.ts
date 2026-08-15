import { LocalStorage } from "@vicinae/api";
import type { WolframQueryResult } from "./wolfram";

export type HistoryEntry = {
  query: string;
  result: WolframQueryResult;
  timestamp: number;
};

const STORAGE_KEY = "wolfram-history";
const MAX_ENTRIES = 100;

export async function getHistory(): Promise<HistoryEntry[]> {
  const raw = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

/** Add (or move to the top, deduping by query) a query's full results. */
export async function addToHistory(
  query: string,
  result: WolframQueryResult,
): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;
  const entries = await getHistory();
  const next: HistoryEntry[] = [
    { query: trimmed, result, timestamp: Date.now() },
    ...entries.filter((e) => e.query !== trimmed),
  ].slice(0, MAX_ENTRIES);
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function removeFromHistory(query: string): Promise<void> {
  const entries = await getHistory();
  await LocalStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(entries.filter((e) => e.query !== query)),
  );
}

export async function clearHistory(): Promise<void> {
  await LocalStorage.removeItem(STORAGE_KEY);
}

export function formatTime(timestamp: number): string {
  const s = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
