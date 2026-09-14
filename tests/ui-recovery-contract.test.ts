import { describe, expect, it } from "vitest";
import { MIN_TOUCH_TARGET, controlProps, liveRegionProps, sliderProps } from "../lib/accessibility";
import { POINTER_EVENTS_POLICY, isStylePointerEvents, nonInteractiveLayerStyle } from "../lib/pointer-events";
import { screenStatusFromFlags } from "../lib/screen-recovery";
import { permissionPurpose, validatePublicAppConfig } from "../lib/app-config-safety";

describe("accessibility, pointer events, and screen status", () => {
  it("exposes roles, hints, and disabled semantics", () => {
    expect(controlProps("Retry Tutor", "Attempts the last question again", true)).toMatchObject({
      accessibilityRole: "button",
      accessibilityLabel: "Retry Tutor",
      accessibilityState: { disabled: true },
    });
    expect(liveRegionProps("You're offline", "assertive").accessibilityLiveRegion).toBe("assertive");
    expect(sliderProps("Gravity", 9.8, 1, 20).accessibilityValue).toEqual({ min: 1, max: 20, now: 9.8 });
    expect(MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(44);
  });

  it("keeps pointerEvents on styles rather than a global suppression", () => {
    expect(POINTER_EVENTS_POLICY.application).toContain("style.pointerEvents");
    expect(isStylePointerEvents("none")).toBe(true);
    expect(nonInteractiveLayerStyle({ position: "absolute" }).pointerEvents).toBe("none");
  });

  it("maps flags into explicit screen statuses", () => {
    expect(screenStatusFromFlags({ loading: true })).toBe("loading");
    expect(screenStatusFromFlags({ offline: true })).toBe("offline");
    expect(screenStatusFromFlags({ error: true })).toBe("error");
    expect(screenStatusFromFlags({ empty: true })).toBe("empty");
    expect(screenStatusFromFlags({})).toBe("success");
  });

  it("explains permission purposes and rejects incomplete public config", () => {
    expect(permissionPurpose("camera")).toMatch(/Physics Lens/);
    expect(validatePublicAppConfig({ appName: "PhysicaAI" }).ok).toBe(false);
    expect(validatePublicAppConfig({ appName: "PhysicaAI", scheme: "physica", iosBundleId: "com.app.physica", androidPackage: "com.app.physica" }).ok).toBe(true);
  });
});
