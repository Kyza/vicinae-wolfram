import { useState, useEffect } from "react";
import {
  flattenResults,
  queryWolfram,
  type ResultItem,
  type WolframQueryResult,
} from "./wolfram";

export type WolframQueryState = {
  loading: boolean;
  result: WolframQueryResult | null;
  items: ResultItem[];
  error: string | null;
};

const EMPTY: WolframQueryState = {
  loading: false,
  result: null,
  items: [],
  error: null,
};

/**
 * Debounced Full Results query. Re-runs `queryWolfram` whenever `query`
 * changes (after `debounceMs`), keeping the latest request's result.
 *
 * `result`/`items` are null/empty until the first successful response.
 */
export function useWolframQuery(
  appid: string,
  query: string,
  debounceMs = 400,
): WolframQueryState {
  const [state, setState] = useState<WolframQueryState>(EMPTY);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setState(EMPTY);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setState({ loading: true, result: null, items: [], error: null });
      try {
        const result = await queryWolfram(appid, trimmed);
        if (cancelled) return;
        setState({
          loading: false,
          result,
          items: flattenResults(result),
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          loading: false,
          result: null,
          items: [],
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [appid, query, debounceMs]);

  return state;
}
