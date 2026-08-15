import {
  Action,
  ActionPanel,
  Icon,
  openExtensionPreferences,
} from "@vicinae/api";
import { copyImageWithToast } from "../lib/copy-image";
import { wolframUrl, type ResultItem } from "../lib/wolfram";

export type ViewMode = "list" | "grid";

function ToggleViewAction({
  mode,
  onToggleView,
}: {
  mode: ViewMode;
  onToggleView: () => void;
}) {
  return (
    <Action
      title={mode === "list" ? "Show Image Grid" : "Show Text List"}
      icon={mode === "list" ? Icon.AppWindowGrid3x3 : Icon.AppWindowList}
      onAction={onToggleView}
    />
  );
}

/**
 * Per-item actions. The first action is the primary (Enter) action: copy text
 * in list mode, copy image in grid mode. The second action (Shift+Enter) toggles
 * between list/grid views.
 */
export function WolframItemActionPanel({
  item,
  query,
  mode,
  onToggleView,
  onRecord,
  onShowHistory,
}: {
  item: ResultItem;
  query: string;
  mode: ViewMode;
  onToggleView: () => void;
  /** Called when any copy action runs (used to save the query to history). */
  onRecord?: () => void;
  /** When provided, shows a "Show History" action. */
  onShowHistory?: () => void;
}) {
  const copyImage = () => {
    onRecord?.();
    void copyImageWithToast(item.imageUrl);
  };

  return (
    <ActionPanel>
      {mode === "grid" ? (
        <Action
          title="Copy Image"
          icon={Icon.CopyClipboard}
          autoFocus
          onAction={copyImage}
        />
      ) : (
        <Action.CopyToClipboard
          title="Copy Text"
          icon={Icon.CopyClipboard}
          content={item.text}
          autoFocus
          onCopy={() => onRecord?.()}
        />
      )}
      <ToggleViewAction mode={mode} onToggleView={onToggleView} />
      {mode === "grid" && item.text ? (
        <Action.CopyToClipboard
          title="Copy Text"
          icon={Icon.Text}
          content={item.text}
          onCopy={() => onRecord?.()}
        />
      ) : null}
      {mode === "list" && item.imageUrl ? (
        <Action title="Copy Image" icon={Icon.Image} onAction={copyImage} />
      ) : null}
      {onShowHistory ? (
        <Action
          title="Show History"
          icon={Icon.Clock}
          onAction={onShowHistory}
        />
      ) : null}
      <Action.OpenInBrowser
        title="Open in Wolfram Alpha"
        url={wolframUrl(query)}
      />
      <Action
        title="Extension Preferences"
        icon={Icon.Cog}
        onAction={() => void openExtensionPreferences()}
      />
    </ActionPanel>
  );
}

/**
 * Actions shown when the App ID is not configured. Primary (Enter) action opens
 * the extension preferences.
 */
export function WolframSetupActions() {
  return (
    <ActionPanel>
      <Action
        title="Set Wolfram App ID"
        icon={Icon.Cog}
        autoFocus
        onAction={() => void openExtensionPreferences()}
      />
    </ActionPanel>
  );
}

/**
 * List/Grid-level actions shown when there are no matching items, so the view
 * toggle and preferences remain reachable with empty results.
 */
export function WolframEmptyActions({
  mode,
  onToggleView,
  onShowHistory,
}: {
  mode: ViewMode;
  onToggleView: () => void;
  onShowHistory?: () => void;
}) {
  return (
    <ActionPanel>
      <ToggleViewAction mode={mode} onToggleView={onToggleView} />
      {onShowHistory ? (
        <Action
          title="Show History"
          icon={Icon.Clock}
          onAction={onShowHistory}
        />
      ) : null}
      <Action
        title="Extension Preferences"
        icon={Icon.Cog}
        onAction={() => void openExtensionPreferences()}
      />
    </ActionPanel>
  );
}
