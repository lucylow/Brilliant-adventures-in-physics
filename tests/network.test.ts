import { describe, expect, it } from "vitest";
import { manualNetworkCheckMessage, networkStateToStatus, networkStatusLabel, networkStatusMessage, recoveryMessage, serviceErrorNetworkStatus } from "../lib/network";

describe("network recovery contracts", () => {
  it("classifies transport failures without treating validation as offline", () => {
    expect(serviceErrorNetworkStatus({ code: "OFFLINE" })).toBe("offline");
    expect(serviceErrorNetworkStatus({ code: "TIMEOUT" })).toBe("unknown");
    expect(serviceErrorNetworkStatus({ code: "VALIDATION_ERROR" })).toBe("online");
  });
  it("normalizes device network state deterministically", () => {
    expect(networkStateToStatus({ isConnected: true, isInternetReachable: true })).toBe("online");
    expect(networkStateToStatus({ isConnected: false, isInternetReachable: false })).toBe("offline");
    expect(networkStateToStatus({ isConnected: true, isInternetReachable: null })).toBe("checking");
    expect(networkStateToStatus({ isConnected: null, isInternetReachable: null })).toBe("unknown");
    expect(networkStateToStatus({ isConnected: true, isInternetReachable: false })).toBe("offline");
  });
  it("provides stable connection labels", () => {
    expect(networkStatusLabel("checking")).toBe("Checking connection");
    expect(networkStatusLabel("offline")).toBe("Offline");
  });
  it("gives actionable messages for offline and timeout states", () => {
    expect(recoveryMessage({ code: "OFFLINE", message: "failed" })).toContain("offline");
    expect(recoveryMessage({ code: "TIMEOUT", message: "failed" })).toContain("too long");
  });
  it("provides privacy-safe banner copy only when action is useful", () => {
    expect(networkStatusMessage("offline")).toContain("stays on this device");
    expect(networkStatusMessage("checking")).toContain("local work remains safe");
    expect(networkStatusMessage("online")).toBeNull();
    expect(networkStatusMessage("unknown")).toBeNull();
  });
  it("provides stable manual-check outcomes for every status", () => {
    expect(manualNetworkCheckMessage("online")).toContain("Connection is available");
    expect(manualNetworkCheckMessage("offline")).toContain("remain on this device");
    expect(manualNetworkCheckMessage("checking")).toContain("still being checked");
    expect(manualNetworkCheckMessage("unknown")).toContain("could not confirm");
  });
});
