export type MediaAdapterCode = "OK" | "CANCELED" | "PERMISSION_DENIED" | "UNAVAILABLE" | "OFFLINE" | "ERROR";
export type MediaAdapterResult<T> = { ok: boolean; code: MediaAdapterCode; data?: T; message: string };
export type MediaAsset = { uri: string; width?: number; height?: number; type?: string | null; fileName?: string | null; caption?: string; capturedAt?: string };

export function normalizeMediaAsset(value: unknown): MediaAsset | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<MediaAsset>;
  if (typeof candidate.uri !== "string" || candidate.uri.length === 0 || candidate.uri.length > 4096) return null;
  const caption = typeof candidate.caption === "string" ? candidate.caption.trim().slice(0, 160) : undefined;
  const capturedAt = typeof candidate.capturedAt === "string" && !Number.isNaN(Date.parse(candidate.capturedAt)) ? candidate.capturedAt : undefined;
  return { uri: candidate.uri, width: typeof candidate.width === "number" && candidate.width > 0 ? Math.round(candidate.width) : undefined, height: typeof candidate.height === "number" && candidate.height > 0 ? Math.round(candidate.height) : undefined, type: candidate.type ?? undefined, fileName: candidate.fileName ?? undefined, caption, capturedAt };
}

export function mediaStatusTranslationKey(code: MediaAdapterCode): string | null {
  if (code === "PERMISSION_DENIED") return "lens.media.permission";
  if (code === "CANCELED") return "lens.media.canceled";
  if (code === "OK") return "lens.media.ready";
  if (code === "UNAVAILABLE") return "lens.media.unavailableMessage";
  if (code === "OFFLINE") return "lens.media.offline";
  if (code === "ERROR") return "lens.media.error";
  return null;
}

export function mediaErrorMessage(code: MediaAdapterCode): string {
  if (code === "PERMISSION_DENIED") return "Permission was not granted. You can enable it in device settings.";
  if (code === "UNAVAILABLE") return "This media feature is unavailable on this device or browser.";
  if (code === "OFFLINE") return "The capture is local-only, but this action requires an available device service.";
  if (code === "CANCELED") return "No media was selected.";
  if (code === "ERROR") return "We could not access media. Your existing study data is unchanged.";
  return "Media is ready on this device.";
}
