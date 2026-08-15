import { useState } from "react";
import type { HistoryEntry } from "../lib/history";
import {
  defaultView,
  getWolframPreferences,
  gridColumns,
} from "../lib/preferences";
import { flattenResults, isInputInterpretation } from "../lib/wolfram";
import {
  WolframGridView,
} from "./wolfram-grid-view";
import { WolframListView } from "./wolfram-list-view";
import type { ViewMode } from "./wolfram-action-panel";

/** Re-renders a saved query's results exactly like the live query view. */
export function WolframHistoryDetail({ entry }: { entry: HistoryEntry }) {
  const prefs = getWolframPreferences();
  const [mode, setMode] = useState<ViewMode>(defaultView(prefs));
  const toggle = () => setMode((m) => (m === "list" ? "grid" : "list"));

  const items = flattenResults(entry.result);
  const inputItem = items.find(isInputInterpretation);
  const inputLabel = inputItem?.text
    ? `Input interpretation: ${inputItem.text}`
    : undefined;
  const textResults = items.filter((i) => i.text && !isInputInterpretation(i));
  const imageResults = items.filter(
    (i) => i.imageUrl && !isInputInterpretation(i),
  );

  if (mode === "grid") {
    return (
      <WolframGridView
        items={imageResults}
        inputLabel={inputLabel}
        query={entry.query}
        mode={mode}
        onToggleView={toggle}
        columns={gridColumns(prefs)}
      />
    );
  }

  return (
    <WolframListView
      items={textResults}
      inputLabel={inputLabel}
      query={entry.query}
      mode={mode}
      onToggleView={toggle}
    />
  );
}
