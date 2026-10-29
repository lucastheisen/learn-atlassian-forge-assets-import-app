import type { ImportTuning } from "./config";
import type {
  AssociationReason,
  Outcome,
  OutcomeCounts,
  ReferenceScope,
  RunFailure,
  RunPhase,
} from "./reference-schemas";

export type {
  AssociationReason,
  Outcome,
  OutcomeCounts,
  ReferenceScope,
  RunFailure,
  RunPhase,
  RunSummary,
} from "./reference-schemas";

export type AssetFields = Record<string, readonly unknown[]>;

export type LookupResult =
  | { accountId: string; status: "matched" }
  | { reason: AssociationReason; status: "unresolved" };

export type UserLookup = (
  fields: AssetFields,
  budget: ProcessingBudget,
) => Promise<LookupResult>;

export class ContinueLater extends Error {
  constructor(readonly delaySeconds = 1) {
    super("Reference processing requires continuation");
  }
}

export class ProductRequestError extends Error {
  constructor(readonly status: number) {
    super(`Product request failed (${status})`);
  }
}

export class SchemaError extends Error {
  constructor() {
    super("User reference schema does not match the code-defined conventions");
  }
}

export class ProcessingBudget {
  readonly deadline: number;

  constructor(
    readonly now: () => number,
    durationMs: number,
  ) {
    this.deadline = now() + durationMs;
  }

  check(requiredMs = 25_000): void {
    if (this.deadline - this.now() < requiredMs) throw new ContinueLater();
  }
}

export interface ReferenceSchema {
  activeAttributeId: string;
  attributeNames?: Record<string, string>;
  emailAttributeId: string;
  objectTypeId: string;
  userAttributeId: string;
}

export interface WorkItem {
  assetId: string;
  assetKey?: string;
  attempts: number;
  httpStatus?: number;
  inventoryPage: number;
  outcome?: Outcome;
  pendingCleanup?: boolean;
  reason?: AssociationReason;
}

export interface PendingReference {
  assetId: string;
  httpStatus?: number;
  reason?: AssociationReason;
  runId: string;
}

export const emptyCounts = (): OutcomeCounts => ({
  deleted: 0,
  inactive: 0,
  unchanged: 0,
  unresolved: 0,
  updated: 0,
});

export interface Aggregation {
  counts: OutcomeCounts;
  offset: number;
  page: number;
  reasons: Partial<Record<AssociationReason, number>>;
  total: number;
}

export interface ReferenceRun extends ReferenceScope {
  aggregation: Aggregation;
  aqlStart: number;
  completedAt?: string;
  deferredUntil?: number;
  discovery: "aql" | "retries" | "sealed";
  executionId?: string;
  failure?: RunFailure;
  failures: number;
  id: string;
  index: number;
  inputChunks: number;
  inputRecords: number;
  inventoryPages: number;
  nativeTerminal?: boolean;
  phase: RunPhase;
  phaseDurationsMs?: Partial<Record<RunPhase, number>>;
  phaseStartedAt?: number;
  previousExecutionId?: string;
  processingOffset: number;
  processingPage: number;
  pruneMetadata?: number;
  pruneOffset?: number;
  prunePage?: number;
  requestedAt: string;
  retention?: {
    done: boolean;
    keep: { key: string; startedAt: string }[];
    pending: string[];
    scanned: boolean;
  };
  retentionDurationMs?: number;
  retryPartition?: number;
  schema?: ReferenceSchema;
  selected: number;
  selectionStartedAt?: string;
  startPrepared?: boolean;
  startedAt?: string;
  timedPhase?: RunPhase;
  tuning: ImportTuning;
  uploadId: string;
}

export interface InventoryPage {
  assetIds: string[];
  nextAqlStart: number;
  nextDiscovery: ReferenceRun["discovery"];
  nextRetryPartition?: number;
  sealed: boolean;
}
