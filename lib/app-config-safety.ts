import { ConfigurationError, err, ok, type Result } from "../shared/errors";

export type PublicAppConfig = {
  appName: string;
  scheme: string;
  iosBundleId: string;
  androidPackage: string;
};

export function validatePublicAppConfig(config: Partial<PublicAppConfig>): Result<PublicAppConfig, ConfigurationError> {
  const appName = config.appName?.trim();
  const scheme = config.scheme?.trim();
  const iosBundleId = config.iosBundleId?.trim();
  const androidPackage = config.androidPackage?.trim();
  if (!appName || !scheme || !iosBundleId || !androidPackage) {
    return err(new ConfigurationError({
      message: "App configuration is incomplete",
      operation: "validatePublicAppConfig",
    }));
  }
  if (!/^[a-z][a-z0-9.]*$/i.test(iosBundleId) || !/^[a-z][a-z0-9.]*$/i.test(androidPackage)) {
    return err(new ConfigurationError({
      message: "Bundle identifiers are invalid",
      operation: "validatePublicAppConfig",
    }));
  }
  return ok({ appName, scheme, iosBundleId, androidPackage });
}

export function permissionPurpose(permission: "camera" | "microphone" | "notifications"): string {
  if (permission === "camera") return "Capture Physics Lens observations on this device.";
  if (permission === "microphone") return "Optional voice notes are local unless you start a supported recording flow.";
  return "Optional reminders stay on this device and are never required to study.";
}
