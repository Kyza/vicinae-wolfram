import { Icon, List, useNavigation } from "@vicinae/api";
import { useState } from "react";
import {
  WolframSetupActions,
  type ViewMode,
} from "./wolfram-action-panel";
import { WolframGridView } from "./wolfram-grid-view";
import { WolframHistoryList } from "./wolfram-history-list";
import { WolframListView } from "./wolfram-list-view";
import { addToHistory } from "../lib/history";
import {
  defaultView,
  getWolframPreferences,
  gridColumns,
} from "../lib/preferences";
import { useWolframQuery } from "../lib/use-wolfram-query";
import { isInputInterpretation } from "../lib/wolfram";

export function WolframQueryView() {
  const { push } = useNavigation();
  const prefs = getWolframPreferences();
  const appid = prefs.appid?.trim() ?? "";

  const [mode, setMode] = useState<ViewMode>(defaultView(prefs));
  const [searchText, setSearchText] = useState("");

  const { loading, result, items, error } = useWolframQuery(appid, searchText);
  const toggle = () => setMode((m) => (m === "list" ? "grid" : "list"));
  const showHistory = () => push(<WolframHistoryList />);

  const record = result
    ? () => void addToHistory(searchText, result)
    : undefined;

  const inputItem = items.find(isInputInterpretation);
  const inputLabel = inputItem?.text
    ? `Input interpretation: ${inputItem.text}`
    : undefined;
  const textResults = items.filter((i) => i.text && !isInputInterpretation(i));
  const imageResults = items.filter(
    (i) => i.imageUrl && !isInputInterpretation(i),
  );

  if (!appid) {
    return (
      <List actions={<WolframSetupActions />}>
        <List.EmptyView
          icon={Icon.Warning}
          title="Wolfram App ID required"
          description="Set your Full Results API App ID in the extension preferences."
        />
      </List>
    );
  }

  if (mode === "grid") {
    return (
      <WolframGridView
        items={imageResults}
        inputLabel={inputLabel}
        query={searchText}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        loading={loading}
        error={error}
        mode={mode}
        onToggleView={toggle}
        onRecord={record}
        onShowHistory={showHistory}
        columns={gridColumns(prefs)}
      />
    );
  }

  return (
    <WolframListView
      items={textResults}
      inputLabel={inputLabel}
      query={searchText}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      loading={loading}
      error={error}
      mode={mode}
      onToggleView={toggle}
      onRecord={record}
      onShowHistory={showHistory}
    />
  );
}
