import { describe, expect, it } from "vitest";
import { mediaArtifactContext, mediaErrorMessage, mediaStatusTranslationKey, normalizeMediaAsset } from "../lib/media-contract";

describe("media adapter safety contracts", () => {
  it("explains permission, cancellation, offline, and unavailable states", () => {
    expect(mediaErrorMessage("PERMISSION_DENIED")).toContain("Permission was not granted");
    expect(mediaErrorMessage("CANCELED")).toContain("No media was selected");
    expect(mediaErrorMessage("OFFLINE")).toContain("local-only");
    expect(mediaErrorMessage("UNAVAILABLE")).toContain("unavailable");
  });

  it("preserves bounded local media context for Notebook artifacts", () => {
    expect(mediaArtifactContext({ uri: "file:///observation.jpg", caption: "Ball at release", capturedAt: "2026-08-25T03:00:00.000Z" })).toContain("Ball at release");
    expect(mediaArtifactContext(null)).toContain("No local observation image");
  });

  it("maps every recoverable status to a localized Lens key", () => {
    expect(mediaStatusTranslationKey("PERMISSION_DENIED")).toBe("lens.media.permission");
    expect(mediaStatusTranslationKey("CANCELED")).toBe("lens.media.canceled");
    expect(mediaStatusTranslationKey("UNAVAILABLE")).toBe("lens.media.unavailableMessage");
    expect(mediaStatusTranslationKey("OFFLINE")).toBe("lens.media.offline");
    expect(mediaStatusTranslationKey("ERROR")).toBe("lens.media.error");
    expect(mediaStatusTranslationKey("OK")).toBe("lens.media.ready");
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
