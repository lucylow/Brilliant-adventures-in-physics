export type VisualState = "idle" | "running" | "paused" | "complete" | "error" | "empty";
export type VisualPoint = { x: number; y: number; t?: number };
export type VisualVector = { x: number; y: number; dx: number; dy: number; label?: string };

export const visualTheme = { background: "#0F172A", grid: "#334155", ink: "#F8FAFC", accent: "#60A5FA", warning: "#F59E0B", success: "#4ADE80", danger: "#F87171" } as const;
export function scaleForWidth(width: number): number { return width < 360 ? 0.9 : width < 600 ? 1 : width < 900 ? 1.12 : 1.24; }
export function visualSize(base: number, width: number): number { return Math.round(base * scaleForWidth(width)); }
export function ticks(min: number, max: number, count = 5): number[] { if (count < 2) return [min]; return Array.from({ length: count }, (_, index) => min + ((max - min) * index) / (count - 1)); }
export function sampleLine(start: VisualPoint, end: VisualPoint, count = 2): VisualPoint[] { if (count < 2) return [start]; return Array.from({ length: count }, (_, index) => { const p = index / (count - 1); return { x: start.x + (end.x - start.x) * p, y: start.y + (end.y - start.y) * p }; }); }
export function vectorMagnitude(vector: Pick<VisualVector, "dx" | "dy">): number { return Math.hypot(vector.dx, vector.dy); }
export function mapPointToViewport(point: VisualPoint, bounds: { maxX: number; maxY: number; width: number; height: number; padding?: number }): { left: number; bottom: number } { const padding = bounds.padding ?? 0; const usableWidth = Math.max(0, bounds.width - padding * 2); const usableHeight = Math.max(0, bounds.height - padding * 2); return { left: padding + (point.x / Math.max(bounds.maxX, 1)) * usableWidth, bottom: padding + (point.y / Math.max(bounds.maxY, 1)) * usableHeight }; }
export function fieldVectors(rows: number, columns: number, spacing: number, direction: { dx: number; dy: number }): VisualVector[] { return Array.from({ length: rows * columns }, (_, index) => { const row = Math.floor(index / columns); const column = index % columns; return { x: column * spacing, y: row * spacing, dx: direction.dx, dy: direction.dy }; }); }
export function visualStateLabel(state: VisualState): string { return ({ idle: "Ready to begin", running: "Simulation running", paused: "Simulation paused", complete: "Simulation complete", error: "Visual unavailable", empty: "No visual data yet" })[state]; }
