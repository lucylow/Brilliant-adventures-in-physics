export type MediaAdapterCode = "OK" | "CANCELED" | "PERMISSION_DENIED" | "UNAVAILABLE" | "OFFLINE" | "ERROR";
export type MediaAdapterResult<T> = { ok: boolean; code: MediaAdapterCode; data?: T; message: string };
export type MediaAsset = { uri: string; width?: number; height?: number; type?: string | null; fileName?: string | null };

export function mediaErrorMessage(code: MediaAdapterCode): string {
  if (code === "PERMISSION_DENIED") return "Permission was not granted. You can enable it in device settings.";
  if (code === "UNAVAILABLE") return "This media feature is unavailable on this device or browser.";
  if (code === "OFFLINE") return "The capture is local-only, but this action requires an available device service.";
  if (code === "CANCELED") return "No media was selected.";
  if (code === "ERROR") return "We could not access media. Your existing study data is unchanged.";
  return "Media is ready on this device.";
}
