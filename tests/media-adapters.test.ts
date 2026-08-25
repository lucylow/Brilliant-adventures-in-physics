import { describe, expect, it } from "vitest";
import { mediaErrorMessage, normalizeMediaAsset } from "../lib/media-contract";

describe("media adapter safety contracts", () => {
  it("explains permission, cancellation, offline, and unavailable states", () => {
    expect(mediaErrorMessage("PERMISSION_DENIED")).toContain("Permission was not granted");
    expect(mediaErrorMessage("CANCELED")).toContain("No media was selected");
    expect(mediaErrorMessage("OFFLINE")).toContain("local-only");
    expect(mediaErrorMessage("UNAVAILABLE")).toContain("unavailable");
  });

  it("bounds captions and rejects malformed or invalid timestamps", () => {
    const safe = normalizeMediaAsset({ uri: "file:///observation.jpg", caption: "  " + "x".repeat(200), capturedAt: "2026-08-25T03:00:00.000Z", width: 640.7, height: 480.2 });
    expect(safe?.caption).toHaveLength(160);
    expect(safe?.width).toBe(641);
    expect(safe?.capturedAt).toContain("2026-08-25");
    expect(normalizeMediaAsset({ uri: "", capturedAt: "not-a-date" })).toBeNull();
  });

  it("keeps the platform-specific availability decision outside the pure contract", () => {
    expect(mediaErrorMessage("UNAVAILABLE")).toContain("unavailable");
  });
});
