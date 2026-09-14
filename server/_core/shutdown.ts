import type { Server } from "http";

export type ShutdownTask = () => Promise<void> | void;

export function installGracefulShutdown(server: Server, tasks: ShutdownTask[] = [], timeoutMs = 8_000): void {
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[api] received ${signal}, shutting down`);
    const timer = setTimeout(() => {
      console.error("[api] shutdown timed out");
      process.exit(1);
    }, timeoutMs);
    timer.unref?.();
    server.close(async () => {
      try {
        for (const task of tasks) {
          await task();
        }
        clearTimeout(timer);
        process.exit(0);
      } catch (error) {
        console.error("[api] shutdown task failed", error instanceof Error ? error.message : "unknown");
        process.exit(1);
      }
    });
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
}
