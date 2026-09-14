import { describe, expect, it } from "vitest";
import { validateMediaMetadata, validateMediaSize, validateMediaUri, MAX_MEDIA_BYTES } from "../lib/media-validation";

describe("media adapters", () => {
  it("rejects missing, remote, and empty URIs", () => {
    expect(validateMediaUri(undefined).ok).toBe(false);
    expect(validateMediaUri("https://example.com/photo.jpg").ok).toBe(false);
    expect(validateMediaUri("file:///local/observation.jpg").ok).toBe(true);
  });

  it("rejects incomplete picker assets and oversized images", () => {
    expect(validateMediaMetadata({}).ok).toBe(false);
    expect(validateMediaMetadata({ uri: "file:///ok.jpg", width: 8000, height: 20 }).ok).toBe(false);
    expect(validateMediaMetadata({ uri: "file:///ok.jpg", width: 800, height: 600 }).ok).toBe(true);
  });

  it("rejects oversized payloads", () => {
    expect(validateMediaSize(0).ok).toBe(false);
    expect(validateMediaSize(MAX_MEDIA_BYTES + 1).ok).toBe(false);
    expect(validateMediaSize(1024).ok).toBe(true);
  });
});
