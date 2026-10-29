import { readFile, writeFile } from "node:fs/promises";
import {
  buildSmokePerformanceReport,
  parseSmokeClientReport,
  requireSmokeMetrics,
} from "./lib/import-smoke-report.js";

const [clientPath, logsPath, outputPath] = process.argv.slice(2);

if (!clientPath || !logsPath || !outputPath)
  throw new Error(
    "Run smoke-import-report.ts <client.json> <forge-logs.txt> <report.json>",
  );

const client = parseSmokeClientReport(
  JSON.parse(await readFile(clientPath, "utf8")),
);

const report = buildSmokePerformanceReport(
  client,
  await readFile(logsPath, "utf8"),
);

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, {
  mode: 0o600,
});

for (const run of report.runs) {
  console.log(
    `execution=${run.executionId} selected=${run.selected} outcomes=${JSON.stringify(run.counts)} reasons=${JSON.stringify(run.reasons)}`,
  );
  console.log(
    `observedWall=${run.observedDurationMs}ms queue=${run.queueWaitMs}ms observedPhases=${JSON.stringify(run.observedPhaseDurationsMs)} retention=${run.retentionDurationMs}ms`,
  );
  console.log(
    `deliveries=${run.deliveriesObserved} active=${run.activeInvocationMs}ms maxQueueLag=${run.maxQueueLagMs}ms counts=${JSON.stringify(run.countsObserved)}`,
  );
  console.log(
    `processingInvocations=${run.processingInvocationsObserved} itemCap=${run.tuning.referenceItems} maxAttempts=${run.maxAssetAttemptsPerInvocation} maxOutcomes=${run.maxOutcomesPerInvocation} maxMetricBytes=${run.maxInvocationLogBytes}`,
  );
}

console.log(
  `Metrics report ${outputPath}, coverage=${JSON.stringify(report.coverage)}`,
);

requireSmokeMetrics(report);
