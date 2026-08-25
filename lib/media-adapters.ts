import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import { mediaErrorMessage, type MediaAdapterResult, type MediaAsset } from "./media-contract";
export type { MediaAdapterResult, MediaAsset, MediaAdapterCode } from "./media-contract";

function assetFromPicker(asset: ImagePicker.ImagePickerAsset | undefined): MediaAsset | undefined {
  if (!asset?.uri) return undefined;
  return { uri: asset.uri, width: asset.width, height: asset.height, type: asset.type, fileName: asset.fileName };
}

export async function pickImageFromLibrary(): Promise<MediaAdapterResult<MediaAsset>> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: false, quality: 0.85 });
    if (result.canceled) return { ok: false, code: "CANCELED", message: mediaErrorMessage("CANCELED") };
    const asset = assetFromPicker(result.assets[0]);
    return asset ? { ok: true, code: "OK", data: asset, message: mediaErrorMessage("OK") } : { ok: false, code: "ERROR", message: mediaErrorMessage("ERROR") };
  } catch {
    return { ok: false, code: Platform.OS === "web" ? "UNAVAILABLE" : "ERROR", message: mediaErrorMessage(Platform.OS === "web" ? "UNAVAILABLE" : "ERROR") };
  }
}

export async function takePhoto(): Promise<MediaAdapterResult<MediaAsset>> {
  try {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (!permission.granted) return { ok: false, code: "PERMISSION_DENIED", message: mediaErrorMessage("PERMISSION_DENIED") };
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], allowsEditing: false, quality: 0.85 });
    if (result.canceled) return { ok: false, code: "CANCELED", message: mediaErrorMessage("CANCELED") };
    const asset = assetFromPicker(result.assets[0]);
    return asset ? { ok: true, code: "OK", data: asset, message: mediaErrorMessage("OK") } : { ok: false, code: "ERROR", message: mediaErrorMessage("ERROR") };
  } catch {
    return { ok: false, code: "ERROR", message: mediaErrorMessage("ERROR") };
  }
}

export function canUseCamera(): boolean { return Platform.OS !== "web"; }
