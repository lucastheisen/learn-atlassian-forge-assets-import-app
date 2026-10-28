export const associationReasons = [
  "ambiguous",
  "asset_fetch_failed",
  "asset_type_changed",
  "email_unavailable",
  "inactive_account",
  "invalid_identity",
  "lookup_failed",
  "missing_identity",
  "unknown_activity",
  "unmatched",
  "update_failed",
] as const;

export type AssociationReason = (typeof associationReasons)[number];
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
    readonly now: () => number = Date.now,
    durationMs = 110_000,
  ) {
    this.deadline = now() + durationMs;
  }
  check(requiredMs = 25_000): void {
    if (this.deadline - this.now() < requiredMs) throw new ContinueLater();
  }
}

export interface ReferenceScope {
  importSourceId: string;
  testing: boolean;
  workspaceId: string;
}

export interface ReferenceSchema {
  attributeNames?: Record<string, string>;
  activeAttributeId: string;
  emailAttributeId: string;
  objectTypeId: string;
  userAttributeId: string;
}

export type Outcome =
  | "deleted"
  | "inactive"
  | "unchanged"
  | "unresolved"
  | "updated";
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
  reason?: AssociationReason;
  runId: string;
  httpStatus?: number;
}

export interface OutcomeCounts {
  deleted: number;
  inactive: number;
  unchanged: number;
  unresolved: number;
  updated: number;
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

export type RunPhase =
  | "queued"
  | "starting"
  | "ingesting"
  | "polling"
  | "discovery"
  | "processing"
  | "aggregation"
  | "finalizing"
  | "complete";
export type RunFailure =
  | "cancelled"
  | "discovery_failed"
  | "native_failed"
  | "native_timeout"
  | "processing_failed"
  | "schema_invalid"
  | "source_deleted";

export interface ReferenceRun extends ReferenceScope {
  aggregation: Aggregation;
  aqlStart: number;
  completedAt?: string;
  discovery: "aql" | "retries" | "sealed";
  deferredUntil?: number;
  executionId?: string;
  failure?: RunFailure;
  id: string;
  index: number;
  inventoryPages: number;
  failures: number;
  nativeTerminal?: boolean;
  phaseDurationsMs?: Partial<Record<RunPhase, number>>;
  phaseStartedAt?: number;
  timedPhase?: RunPhase;
  phase: RunPhase;
  previousExecutionId?: string;
  processingOffset: number;
  processingPage: number;
  requestedAt: string;
  retentionDurationMs?: number;
  retryPartition?: number;
  schema?: ReferenceSchema;
  selected: number;
  selectionStartedAt?: string;
  startedAt?: string;
  startPrepared?: boolean;
  uploadId: string;
  prunePage?: number;
  pruneOffset?: number;
  pruneMetadata?: number;
  retention?: {
    keep: { key: string; startedAt: string }[];
    pending: string[];
    scanned: boolean;
    done: boolean;
  };
}

export interface InventoryPage {
  assetIds: string[];
  nextAqlStart: number;
  nextDiscovery: ReferenceRun["discovery"];
  nextRetryPartition?: number;
  sealed: boolean;
}

export interface RunSummary extends ReferenceScope {
  completedAt: string;
  counts: OutcomeCounts;
  detailsPrefix: string;
  durationMs: number;
  executionId?: string;
  failure?: RunFailure;
  phaseDurationsMs: Partial<Record<RunPhase, number>>;
  reasons: Partial<Record<AssociationReason, number>>;
  runId: string;
  retentionDurationMs: number;
  selected: number;
  selectionComplete: boolean;
  startedAt: string;
  status: "failed" | "success" | "with_errors";
  unfinished: number;
}
