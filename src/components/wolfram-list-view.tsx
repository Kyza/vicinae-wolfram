import { Icon, List } from "@vicinae/api";
import type { ResultItem } from "../lib/wolfram";
import {
  WolframEmptyActions,
  WolframItemActionPanel,
  type ViewMode,
} from "./wolfram-action-panel";

export function WolframListView({
  items,
  inputLabel,
  query,
  searchText,
  onSearchTextChange,
  loading = false,
  error = null,
  mode,
  onToggleView,
  onRecord,
  onShowHistory,
}: {
  items: ResultItem[];
  inputLabel?: string;
  /** Raw query, used for the "Open in Wolfram Alpha" action. */
  query: string;
  /** Controlled search text; omit for a static (history) view with built-in filtering. */
  searchText?: string;
  onSearchTextChange?: (text: string) => void;
  loading?: boolean;
  error?: string | null;
  mode: ViewMode;
  onToggleView: () => void;
  onRecord?: () => void;
  onShowHistory?: () => void;
}) {
  const hasQuery = Boolean(searchText && searchText.trim());
  const emptyIcon = loading
    ? Icon.CircleProgress
    : error
      ? Icon.Warning
      : Icon.MagnifyingGlass;
  const emptyTitle = error ? "Query failed" : loading ? "" : "No results";
  const emptyDescription = error
    ? error
    : searchText !== undefined && !hasQuery
      ? "Type a query to ask Wolfram Alpha."
      : "No text results.";

  return (
    <List
      isLoading={loading}
      searchText={searchText}
      onSearchTextChange={onSearchTextChange}
      searchBarPlaceholder={
        searchText !== undefined ? "Ask Wolfram Alpha..." : "Filter results..."
      }
      navigationTitle={searchText === undefined ? query : undefined}
      actions={
        <WolframEmptyActions
          mode={mode}
          onToggleView={onToggleView}
          onShowHistory={onShowHistory}
        />
      }
    >
      {items.length === 0 ? (
        <List.EmptyView
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <List.Section title={inputLabel}>
          {items.map((item) => (
            <List.Item
              key={item.key}
              id={item.key}
              title={item.text}
              subtitle={
                item.subpodTitle
                  ? `${item.podTitle} · ${item.subpodTitle}`
                  : item.podTitle
              }
              actions={
                <WolframItemActionPanel
                  item={item}
                  query={query}
                  mode={mode}
                  onToggleView={onToggleView}
                  onRecord={onRecord}
                  onShowHistory={onShowHistory}
                />
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
