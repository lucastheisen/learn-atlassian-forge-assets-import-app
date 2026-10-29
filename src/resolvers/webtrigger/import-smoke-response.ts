import type { SmokePendingPhase } from "../../lib/reference-schemas";

export type SmokeResponse =
  | ReturnType<typeof smokePending>
  | ReturnType<typeof smokeFailed>;

export const smokeFailed = () => ({ outputKey: "smoke-failed" as const });

export const smokePending = (phase: SmokePendingPhase) => ({
  outputKey: `smoke-pending-${phase}` as const,
});
