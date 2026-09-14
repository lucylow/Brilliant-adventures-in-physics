import { ConfigurationError } from "../../shared/errors";

export type ServerConfig = {
  nodeEnv: string;
  port: number;
  hasDatabase: boolean;
  hasJwtSecret: boolean;
  hasForgeKey: boolean;
  isProduction: boolean;
};

export function readServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const port = Number.parseInt(env.PORT || "3000", 10);
  return {
    nodeEnv: env.NODE_ENV ?? "development",
    port: Number.isFinite(port) && port > 0 ? port : 3000,
    hasDatabase: Boolean(env.DATABASE_URL),
    hasJwtSecret: Boolean(env.JWT_SECRET),
    hasForgeKey: Boolean(env.BUILT_IN_FORGE_API_KEY),
    isProduction: env.NODE_ENV === "production",
  };
}

export function validateServerConfig(config: ServerConfig): ConfigurationError[] {
  const errors: ConfigurationError[] = [];
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    errors.push(new ConfigurationError({ message: "PORT must be a valid TCP port", operation: "startup" }));
  }
  if (config.isProduction && !config.hasJwtSecret) {
    errors.push(new ConfigurationError({ message: "JWT_SECRET is required in production", operation: "startup" }));
  }
  return errors;
}

export function startupDiagnostics(config: ServerConfig): string[] {
  return [
    `env=${config.nodeEnv}`,
    `port=${config.port}`,
    `database=${config.hasDatabase ? "configured" : "not-configured"}`,
    `jwt=${config.hasJwtSecret ? "configured" : "missing"}`,
    `forge=${config.hasForgeKey ? "configured" : "missing"}`,
  ];
}
