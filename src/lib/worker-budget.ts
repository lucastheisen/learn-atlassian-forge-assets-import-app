import { getAppContext } from "@forge/api";
import { ProcessingBudget } from "./reference-types";

export function createWorkerBudget(
  finalizationBudgetMs: number,
): ProcessingBudget {
  // Forge applies the manifest timeout and accounts for invocation time already spent.
  const remainingMs = getAppContext().invocationRemainingTimeInMillis();
  const durationMs = Math.max(0, remainingMs - finalizationBudgetMs);
  return new ProcessingBudget(Date.now, durationMs);
}
