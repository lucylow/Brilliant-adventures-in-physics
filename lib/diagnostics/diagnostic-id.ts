const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createDiagnosticId(now = Date.now(), random = Math.random): string {
  const time = now.toString(36).toUpperCase().padStart(8, "0").slice(-8);
  let suffix = "";
  for (let index = 0; index < 4; index += 1) {
    suffix += ALPHABET[Math.floor(random() * ALPHABET.length)] ?? "X";
  }
  return `BAV-${time}-${suffix}`;
}

export function isDiagnosticId(value: unknown): value is string {
  return typeof value === "string" && /^BAV-[A-Z0-9]{8}-[A-Z0-9]{4}$/.test(value);
}
