import { Grid, Icon } from "@vicinae/api";
import type { ResultItem } from "../lib/wolfram";
import {
  WolframEmptyActions,
  WolframItemActionPanel,
  type ViewMode,
} from "./wolfram-action-panel";

export function WolframGridView({
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
  columns,
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
  columns: number;
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
      : "No image results.";

  return (
    <Grid
      columns={columns}
      aspectRatio="4/3"
      fit={Grid.Fit.Contain}
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
        <Grid.EmptyView
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <Grid.Section title={inputLabel}>
          {items.map((item) => (
            <Grid.Item
              key={item.key}
              id={item.key}
              content={item.imageUrl}
              title={item.podTitle}
              subtitle={item.text || item.subpodTitle}
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
        </Grid.Section>
      )}
    </Grid>
  );
}
