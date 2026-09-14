import { Camera } from "expo-camera";
import { Platform } from "react-native";
import { MediaPermissionError, MediaUnavailableError, NetworkError, ValidationError, err, ok, type Result } from "../shared/errors";
import { mediaErrorMessage, type MediaAsset } from "./media-contract";
import { pickImageFromLibrary, takePhoto } from "./media-adapters";
import { validateMediaMetadata, validateMediaUri } from "./media-validation";

export { MAX_DIMENSION, MAX_MEDIA_BYTES, validateMediaMetadata, validateMediaSize, validateMediaUri } from "./media-validation";

export async function requestCameraPermissionSafe(): Promise<Result<{ granted: boolean }, MediaPermissionError | MediaUnavailableError>> {
  try {
    if (Platform.OS === "web") {
      return err(new MediaUnavailableError({
        message: mediaErrorMessage("UNAVAILABLE"),
        operation: "requestCameraPermissionSafe",
        feature: "lens",
      }));
    }
    const permission = await Camera.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return err(new MediaPermissionError({
        message: mediaErrorMessage("PERMISSION_DENIED"),
        operation: "requestCameraPermissionSafe",
        feature: "lens",
      }));
    }
    return ok({ granted: true });
  } catch (cause) {
    return err(new MediaUnavailableError({
      message: mediaErrorMessage("ERROR"),
      operation: "requestCameraPermissionSafe",
      feature: "lens",
      cause,
    }));
  }
}

export async function pickImageSafe(): Promise<Result<MediaAsset, MediaUnavailableError | ValidationError | MediaPermissionError | NetworkError>> {
  const result = await pickImageFromLibrary();
  if (result.ok && result.data) {
    return validateMediaMetadata(result.data);
  }
  if (result.code === "CANCELED") {
    return err(new ValidationError({ message: mediaErrorMessage("CANCELED"), operation: "pickImageSafe", feature: "lens", retryable: false }));
  }
  if (result.code === "PERMISSION_DENIED") {
    return err(new MediaPermissionError({ message: result.message, operation: "pickImageSafe", feature: "lens" }));
  }
  if (result.code === "OFFLINE") {
    return err(new NetworkError({ message: result.message, operation: "pickImageSafe", feature: "lens" }));
  }
  return err(new MediaUnavailableError({ message: result.message, operation: "pickImageSafe", feature: "lens" }));
}

export async function takePhotoSafe(): Promise<Result<MediaAsset, MediaUnavailableError | ValidationError | MediaPermissionError>> {
  const permission = await requestCameraPermissionSafe();
  if (!permission.ok) return permission;
  const result = await takePhoto();
  if (result.ok && result.data) return validateMediaMetadata(result.data);
  if (result.code === "CANCELED") {
    return err(new ValidationError({ message: mediaErrorMessage("CANCELED"), operation: "takePhotoSafe", feature: "lens" }));
  }
  if (result.code === "PERMISSION_DENIED") {
    return err(new MediaPermissionError({ message: result.message, operation: "takePhotoSafe", feature: "lens" }));
  }
  return err(new MediaUnavailableError({ message: result.message, operation: "takePhotoSafe", feature: "lens" }));
}

export async function removeMediaSafe(uri: unknown): Promise<Result<true, ValidationError>> {
  const valid = validateMediaUri(uri);
  if (!valid.ok) return valid;
  return ok(true);
}
