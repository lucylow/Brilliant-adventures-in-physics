import { writeFileSync } from "node:fs";
import { seedDemo } from "../lib/mock/seed";
import { generateMockDataReport } from "../lib/mock/expansion/report";

const dataset = seedDemo();
const report = generateMockDataReport(dataset, "active-learner");
writeFileSync("docs/mock-data-report.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report.counts, null, 2));
