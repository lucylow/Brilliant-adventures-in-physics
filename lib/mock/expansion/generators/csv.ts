import type { CsvTable } from "../types";

export function toCsv(table: CsvTable): string {
  const header = table.columns.map((column) => `${column.header} (${column.unit})`).join(",");
  const body = table.rows.map((row) => row.map((cell) => formatCell(cell)).join(",")).join("\n");
  return `${header}\n${body}\n`;
}

export function fromCsv(text: string, id = "csv-parsed"): CsvTable {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length < 2) {
    throw new Error("CSV requires a header and at least one data row");
  }
  const columns = lines[0].split(",").map((raw) => {
    const match = raw.trim().match(/^(.*)\s*\(([^)]+)\)\s*$/);
    return match ? { header: match[1].trim(), unit: match[2].trim() } : { header: raw.trim(), unit: "1" };
  });
  const rows = lines.slice(1).map((line) =>
    line.split(",").map((cell) => {
      const value = Number(cell.trim());
      if (!Number.isFinite(value)) throw new Error(`Non-numeric CSV cell: ${cell}`);
      return value;
    }),
  );
  return {
    id,
    title: id,
    metadata: { experimentId: id, instrument: "parsed", mockLabel: "MOCK_LAB_EXPORT" },
    columns,
    rows,
  };
}

export function validateCsvDataset(table: CsvTable): string[] {
  const errors: string[] = [];
  if (table.columns.length === 0) errors.push("CSV has no columns");
  table.rows.forEach((row, index) => {
    if (row.length !== table.columns.length) errors.push(`row ${index} has ${row.length} cells, expected ${table.columns.length}`);
    row.forEach((cell, cellIndex) => {
      if (!Number.isFinite(cell)) errors.push(`row ${index} col ${cellIndex} is not finite`);
    });
  });
  return errors;
}

export function summarizeDataset(table: CsvTable): { rows: number; columns: number; mins: number[]; maxs: number[]; means: number[] } {
  const columns = table.columns.length;
  const mins = Array.from({ length: columns }, () => Number.POSITIVE_INFINITY);
  const maxs = Array.from({ length: columns }, () => Number.NEGATIVE_INFINITY);
  const sums = Array.from({ length: columns }, () => 0);
  for (const row of table.rows) {
    row.forEach((cell, index) => {
      mins[index] = Math.min(mins[index], cell);
      maxs[index] = Math.max(maxs[index], cell);
      sums[index] += cell;
    });
  }
  const n = Math.max(1, table.rows.length);
  return {
    rows: table.rows.length,
    columns,
    mins,
    maxs,
    means: sums.map((sum) => sum / n),
  };
}

export function malformedCsvFixtures(): Record<string, string> {
  return {
    missingHeader: "1,2,3\n4,5,6\n",
    raggedRow: "t (s),x (m)\n0,0\n1\n",
    nonNumeric: "t (s),x (m)\n0,apple\n",
    empty: "",
  };
}

function formatCell(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 1e6) / 1e6);
}

export function createCsvTable(id: string, title: string, experimentId: string, columns: CsvTable["columns"], rows: number[][]): CsvTable {
  return {
    id,
    title,
    metadata: { experimentId, instrument: "demo-logger", mockLabel: "MOCK_LAB_EXPORT" },
    columns,
    rows,
  };
}
