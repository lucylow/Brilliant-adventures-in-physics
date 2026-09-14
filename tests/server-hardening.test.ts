import { describe, expect, it } from "vitest";
import { classifyDatabaseError, databaseErrorCode, toTrpcDatabaseError } from "../server/_core/db-errors";
import { readServerConfig, startupDiagnostics, validateServerConfig } from "../server/_core/startup";

describe("server database and startup hardening", () => {
  it("classifies connection, duplicate, and timeout errors", () => {
    expect(classifyDatabaseError(new Error("ECONNREFUSED"))).toBe("connection");
    expect(classifyDatabaseError({ code: "ER_DUP_ENTRY", message: "duplicate" })).toBe("duplicate");
    expect(classifyDatabaseError(new Error("Lock wait timeout exceeded"))).toBe("timeout");
    expect(databaseErrorCode("not_found")).toBe("NOT_FOUND");
  });

  it("does not leak SQL text through TRPC messages", () => {
    const trpcError = toTrpcDatabaseError(new Error("ER_PARSE_ERROR near 'DROP TABLE users'"), "upsertUser");
    expect(trpcError.message).not.toContain("DROP TABLE");
    expect(trpcError.message).toMatch(/invalid|request/i);
  });

  it("requires JWT in production and reports startup diagnostics", () => {
    const production = readServerConfig({ NODE_ENV: "production", PORT: "3000" });
    expect(validateServerConfig(production).length).toBeGreaterThan(0);
    const development = readServerConfig({ NODE_ENV: "development", PORT: "3000", JWT_SECRET: "local" });
    expect(validateServerConfig(development)).toEqual([]);
    expect(startupDiagnostics(development).join(" ")).toContain("jwt=configured");
  });
});
