import { ValidationError, err, ok, type Result } from "../shared/errors";
import { isPreviewableLocalMediaUri, normalizeMediaAsset, type MediaAsset } from "./media-contract";

export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
export const MAX_DIMENSION = 4096;

export function validateMediaUri(value: unknown): Result<string, ValidationError> {
  if (!isPreviewableLocalMediaUri(value)) {
    return err(new ValidationError({
      message: "Media URI is missing or not a local previewable image.",
      operation: "validateMediaUri",
      feature: "lens",
    }));
  }
  return ok(value);
}

export function validateMediaMetadata(value: unknown): Result<MediaAsset, ValidationError> {
  const asset = normalizeMediaAsset(value);
  if (!asset) {
    return err(new ValidationError({
      message: "The selected image is missing or incomplete. You can continue with typed measurements.",
      operation: "validateMediaMetadata",
      feature: "lens",
    }));
  }
  if (asset.width && asset.width > MAX_DIMENSION) {
    return err(new ValidationError({
      message: "That image is too large to attach to this experiment.",
      operation: "validateMediaMetadata",
      feature: "lens",
      safeMetadata: { width: asset.width },
    }));
  }
  if (asset.height && asset.height > MAX_DIMENSION) {
    return err(new ValidationError({
      message: "That image is too large to attach to this experiment.",
      operation: "validateMediaMetadata",
      feature: "lens",
      safeMetadata: { height: asset.height },
    }));
  }
  return ok(asset);
}

export function validateMediaSize(bytes: unknown): Result<number, ValidationError> {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) {
    return err(new ValidationError({ message: "Media size is unknown", operation: "validateMediaSize" }));
  }
  if (bytes > MAX_MEDIA_BYTES) {
    return err(new ValidationError({
      message: "That image is too large to keep on this device for Physics Lens.",
      operation: "validateMediaSize",
      safeMetadata: { bytes },
    }));
  }
  return ok(bytes);
}
