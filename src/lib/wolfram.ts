const API_BASE = "https://api.wolframalpha.com/v2/query";

/**
 * A single subpod image as returned by the Full Results API (`format=image`).
 * Mirrors the `<img>` element attributes from the XML response.
 */
export type WolframImage = {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
};

/**
 * One subpod: the atomic unit of a Wolfram Alpha answer. May contain plaintext
 * (when `format=plaintext`), an image (when `format=image`), or both, plus
 * Wolfram Language syntax (when `format=minput,moutput`).
 */
export type WolframSubpod = {
  title?: string;
  plaintext?: string;
  img?: WolframImage;
  minput?: string;
  moutput?: string;
};

export type WolframPod = {
  title?: string;
  scanner?: string;
  id?: string;
  position?: number;
  error?: boolean;
  numsubpods?: number;
  primary?: boolean;
  subpods?: WolframSubpod[];
};

export type WolframQueryResult = {
  success: boolean;
  error: boolean;
  numpods: number;
  pods?: WolframPod[];
};

/** A flattened, view-ready result: one item per (pod, subpod) pair. */
export type ResultItem = {
  /** Stable key derived from pod id/position + subpod index. */
  key: string;
  podId: string;
  podTitle: string;
  podPosition: number;
  primary: boolean;
  subpodTitle: string;
  /** `plaintext` content (may be empty when the subpod has no text). */
  text: string;
  /** `img.src` (may be empty when the subpod has no image). */
  imageUrl: string;
  /** Wolfram Language input expression (may be empty). */
  minput: string;
  /** Wolfram Language output value (may be empty). */
  moutput: string;
};

type RawResponse = {
  queryresult?: WolframQueryResult;
};

function upgradeToHttps(url: string): string {
  return url.startsWith("http://") ? `https://${url.slice("http://".length)}` : url;
}

/**
 * Run a Full Results query. Requests both `image` and `plaintext` formats so a
 * single call feeds the list (text) and grid (image) views.
 *
 * @throws if the request fails or the API reports an error (e.g. bad App ID).
 */
export async function queryWolfram(
  appid: string,
  input: string,
): Promise<WolframQueryResult> {
  const params = new URLSearchParams({
    appid,
    input,
    output: "json",
    format: "image,plaintext,minput,moutput",
  });
  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) {
    // Wolfram returns e.g. {"status":401,"message":"Invalid appid"}.
    let detail = "";
    try {
      const body = (await res.json()) as { message?: string };
      detail = body.message ? `: ${body.message}` : "";
    } catch {
      // non-JSON error body; fall through to the generic message
    }
    throw new Error(`Wolfram Alpha request failed (${res.status}${detail})`);
  }
  const json = (await res.json()) as RawResponse;
  const result = json.queryresult;
  if (!result) {
    throw new Error("Wolfram Alpha returned an unexpected response");
  }
  if (result.error) {
    throw new Error("Wolfram Alpha reported an error (check your App ID)");
  }
  return result;
}

/**
 * Flatten pods/subpods into view items. Subpods without any content are dropped.
 */
export function flattenResults(result: WolframQueryResult): ResultItem[] {
  const items: ResultItem[] = [];
  for (const pod of result.pods ?? []) {
    const podTitle = pod.title ?? pod.id ?? "Result";
    const podId = pod.id ?? pod.title ?? String(pod.position ?? "");
    pod.subpods?.forEach((subpod, i) => {
      const text = (subpod.plaintext ?? "").trim();
      const imageUrl = subpod.img?.src
        ? upgradeToHttps(subpod.img.src)
        : "";
      if (!text && !imageUrl) return;
      items.push({
        key: `${podId}-${i}`,
        podId,
        podTitle,
        podPosition: pod.position ?? items.length,
        primary: pod.primary === true,
        subpodTitle: subpod.title ?? "",
        text,
        imageUrl,
        minput: (subpod.minput ?? "").trim(),
        moutput: (subpod.moutput ?? "").trim(),
      });
    });
  }
  return items;
}

/**
 * The input-interpretation pod (`id === "Input"`) echoes the normalized query
 * (e.g. "2+2" -> "2 + 2"). Rendered as a header above the results, not as an item.
 */
export function isInputInterpretation(item: ResultItem): boolean {
  return item.podId === "Input" || item.podTitle === "Input interpretation";
}

/** First non-input text result, for compact summaries (e.g. history subtitles). */
export function firstResultText(result: WolframQueryResult): string {
  for (const item of flattenResults(result)) {
    if (item.text && !isInputInterpretation(item)) return item.text;
  }
  return "";
}

/** URL to view the same query on the Wolfram Alpha website. */
export function wolframUrl(input: string): string {
  return `https://www.wolframalpha.com/input?i=${encodeURIComponent(input)}`;
}
