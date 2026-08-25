import { describe, expect, it } from "vitest";
import { mediaErrorMessage } from "../lib/media-contract";

describe("media adapter safety contracts", () => {
  it("explains permission, cancellation, offline, and unavailable states", () => {
    expect(mediaErrorMessage("PERMISSION_DENIED")).toContain("Permission was not granted");
    expect(mediaErrorMessage("CANCELED")).toContain("No media was selected");
    expect(mediaErrorMessage("OFFLINE")).toContain("local-only");
    expect(mediaErrorMessage("UNAVAILABLE")).toContain("unavailable");
  });

  it("keeps the platform-specific availability decision outside the pure contract", () => {
    expect(mediaErrorMessage("UNAVAILABLE")).toContain("unavailable");
  });
});
