import { afterEach, describe, expect, it } from "vitest";
import { createDiagnosticId, isDiagnosticId, recordFailure, setDiagnosticSink } from "../lib/diagnostics";

describe("diagnostics", () => {
  afterEach(() => setDiagnosticSink(null));

  it("creates bounded diagnostic IDs", () => {
    const id = createDiagnosticId(1_700_000_000_000, () => 0);
    expect(isDiagnosticId(id)).toBe(true);
    expect(id.startsWith("BAV-")).toBe(true);
  });

  it("records failures without raw secrets", () => {
    const captured: unknown[] = [];
    setDiagnosticSink((record) => captured.push(record));
    const result = recordFailure(new Error("Authorization Bearer secret-value failed"), "tutor.request", "tutor");
    expect(result.error.diagnosticId).toBeTruthy();
    expect(JSON.stringify(captured)).not.toMatch(/secret-value/);
    expect(result.diagnostic.operation).toBe("tutor.request");
  });
});
