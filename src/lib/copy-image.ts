import { Clipboard, showToast, Toast } from "@vicinae/api";
import { randomUUID } from "node:crypto";
import { writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MIME_EXT: Record<string, string> = {
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function extFromContentType(contentType: string | null): string | undefined {
  if (!contentType) return undefined;
  return MIME_EXT[contentType.split(";")[0].trim().toLowerCase()];
}

function extFromUrl(url: string): string | undefined {
  const m = /MSPStoreType=image\/(gif|jpeg|png|webp)/i.exec(url);
  if (m) return MIME_EXT[`image/${m[1].toLowerCase()}`];
  return undefined;
}

/**
 * Download a Wolfram result image to a temp file and copy it to the clipboard
 * as a file (so it pastes as an image where supported).
 *
 * @returns the temp file path, or null if the download failed.
 */
export async function copyImageToClipboard(url: string): Promise<string | null> {
  let file = "";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download failed (${res.status})`);
    const bytes = Buffer.from(await res.arrayBuffer());
    const ext =
      extFromContentType(res.headers.get("content-type")) ??
      extFromUrl(url) ??
      ".gif";
    file = join(tmpdir(), `wolfram-${randomUUID()}${ext}`);
    await writeFile(file, bytes);
    await Clipboard.copy({ file });
    return file;
  } catch (err) {
    if (file) {
      await rm(file, { force: true }).catch(() => {});
    }
    throw err;
  }
}

/** Copy an image with a success/failure toast. */
export async function copyImageWithToast(url: string): Promise<void> {
  try {
    await copyImageToClipboard(url);
    await showToast({
      title: "Image copied to clipboard",
      style: Toast.Style.Success,
    });
  } catch (err) {
    await showToast({
      title: "Failed to copy image",
      message: err instanceof Error ? err.message : String(err),
      style: Toast.Style.Failure,
    });
  }
}
