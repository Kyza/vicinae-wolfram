import {
  Action,
  ActionPanel,
  Icon,
  List,
  useNavigation,
} from "@vicinae/api";
import { useEffect, useState } from "react";
import { WolframHistoryDetail } from "./wolfram-history-detail";
import { WolframQueryView } from "./wolfram-query-view";
import {
  clearHistory,
  formatTime,
  getHistory,
  removeFromHistory,
  type HistoryEntry,
} from "../lib/history";
import { firstResultText } from "../lib/wolfram";

export function WolframHistoryList() {
  const { push } = useNavigation();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    void getHistory().then((e) => {
      setEntries(e);
      setLoading(false);
    });
  };
  useEffect(reload, []);

  const newQuery = () => push(<WolframQueryView />);

  return (
    <List
      isLoading={loading}
      searchBarPlaceholder="Search history..."
      actions={
        <ActionPanel>
          <Action
            title="New Query"
            icon={Icon.MagnifyingGlass}
            onAction={newQuery}
          />
        </ActionPanel>
      }
    >
      {entries.length === 0 ? (
        <List.EmptyView
          icon={Icon.Clock}
          title="No history"
          description="Copy a result in the query view and it will be saved here."
        />
      ) : (
        entries.map((entry) => (
          <List.Item
            key={entry.query}
            id={entry.query}
            title={entry.query}
            subtitle={firstResultText(entry.result)}
            accessories={[{ text: formatTime(entry.timestamp) }]}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Open"
                  icon={Icon.Eye}
                  autoFocus
                  target={<WolframHistoryDetail entry={entry} />}
                />
                <Action.CopyToClipboard
                  title="Copy Query"
                  icon={Icon.CopyClipboard}
                  content={entry.query}
                />
                <Action
                  title="New Query"
                  icon={Icon.MagnifyingGlass}
                  onAction={newQuery}
                />
                <Action
                  title="Remove"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={() => {
                    void removeFromHistory(entry.query).then(reload);
                  }}
                />
                <Action
                  title="Clear History"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={() => {
                    void clearHistory().then(reload);
                  }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
