# User references after import

The native import mapping still excludes User attributes. This app populates `Atlassian User` after a successful native import, using the current Assets objects as the authority for the association.

The native mapping must select the full user dataset with the `users` selector. Exactly one mapped object type must use that selector. That type needs `Email`, a Boolean `Active` attribute, and an editable User attribute named `Atlassian User` with maximum cardinality **1**. Numeric object type and attribute IDs are resolved from source/type metadata. These conventions are defined in code. There are no additional configuration controls.

`lookupUserByEmail` implements the `UserLookup` contract in `reference-types.ts`. It receives named asset fields and a processing budget, and returns either one account ID or an unresolved reason. API failures remain exceptions. A future implementation can use employee number and SCIM data behind this same interface. The queue and reference update code accept the lookup function independently of its implementation.

The email implementation normalizes surrounding whitespace and case, pages Jira user search, and confirms candidate emails through the app-only user email API. Only active Atlassian accounts are eligible. It rejects ambiguous matches and incomplete email confirmation rather than taking the first suggested account. Missing, malformed, unmatched, or ambiguous identity data preserves the existing reference and produces an unresolved result. A uniquely resolved different account replaces the existing reference. An already matching reference requires no write. Every write contains just the target attribute and one account ID.

## Lifecycle and recovery

Both the Assets module hook and the authenticated `import-start` command persist a request before enqueueing it. All native workers and reference workers use the installation-wide `import-lifecycle` concurrency key with limit 1. The consumer claims a durable admission key with `FAIL_IF_EXISTS`. Subsequent requests defer until that lifecycle completes. The admission key has no expiry that could allow a successor to overlap a slow worker.

The lifecycle covers admission, ingestion, native processing, discovery, association work, aggregation, and summary persistence. It records the import start time before creating the native execution. Chunk IDs are deterministic so retrying ingestion does not introduce a new logical chunk. Recovery reconciles an execution created before its ID was checkpointed. Native completion is polled by execution ID, requiring `DONE`, a `FINISHED` progress result with `result: OK`, and no import/type errors before discovery can begin. `DONE` alone is insufficient. See the [Assets import workflow](https://developer.atlassian.com/cloud/assets/imports-rest-api-guide/workflow/).

Discovery selects the mapped object type with `(Updated >= import-start OR "Atlassian User" IS EMPTY)`, using an inclusive UTC timestamp rounded down to the minute. A failed or cancelled run preserves its earliest selection timestamp for the next full import, including candidates an interrupted discovery never reached. Discovery merges these assets with durable pending retries and seals the deduplicated inventory before any reference writes begin. Processing re-reads the current asset rather than replaying uploaded user data.

Each attempt persists pending recovery state first. Confirmed deleted assets and assets whose authoritative `Active` value is false remove pending retries without changing their reference. Unknown activity and lookup/update failures retain pending state. Inactive or absent Jira accounts do not make an asset inactive. A cleanup failure following a successful association resumes cleanup. An uncertain Assets write is re-read before another write is considered. Terminal results are reused on duplicate queue delivery, and aggregation reads stored outcomes instead of incrementing counters per delivery.

Workers have a 300-second Forge timeout and a default 60-second finalization reserve. The work budget is calculated from the remaining invocation runtime minus that reserve. An ingestion invocation submits up to 200 upload chunks, checkpointing each chunk independently and checking cancellation between chunks. Reference processing attempts up to 200 individual assets with at most four assets in flight. These are different units, and an uploaded chunk can contain many user records. Both caps are secondary bounds, and elapsed time can require an earlier yield. Product requests use a supported abort signal with a 20-second timeout, and budget checks apply inside lookup pagination and retries. The worker awaits requests and all in-flight items. It does not assume an aborted write rolled back. Mocked latency fixtures cover 20/100/1,000-item reference caps. Live throughput still needs measurement.

Rate limits defer work rather than sleeping inside the invocation. A durable not-before time preserves long `Retry-After` delays across queue deliveries. An asset gets at most three processing attempts per run. Unresolved work remains pending for the next full import. Native processing exceeding 30 minutes marks the run failed but retains admission until a terminal native state is observed. The lifecycle limit defaults to two hours and stops further reference attempts while preserving recovery state. Cancellation similarly waits for native processing to end if Assets has already left its cancellable ingestion phase.

The five-minute recovery trigger re-enqueues stored active and waiting requests if continuation delivery fails or retries are exhausted. Old events cannot mutate a successor's state. Every worker must claim the same active run before doing work. Source deletion cancels work, waits for admission to be released, and removes its run and pending state. A short-lived deletion marker guards late deliveries.

## Performance tuning

The shared `Config` model in `src/lib/config.ts` contains the native mapping string and a nested `tuning` object. `ConfigSchema` supplies the hardcoded defaults, and `readConfig` returns an independent validated copy. The existing `getConfig` resolver combines those defaults with the current Assets mapping. The configuration screen continues to edit only that mapping. Tuning persistence and UI controls are deferred.

Import creation reads tuning through the same configuration function and snapshots it in the request manifest before enqueueing. This snapshot is execution metadata and is separate from the imported user records. Continuations use that snapshot, and completed summaries and invocation logs preserve it for comparisons. Later configuration changes apply only to new imports. Development records from superseded formats can be discarded rather than migrated.

| Setting | Default | Supported range | Effect |
| --- | ---: | ---: | --- |
| `finalizationBudgetMs` | 60,000 | Positive integer | Time reserved after processing for checkpointing and continuation, in milliseconds |
| `ingestionChunks` | 200 | 1 to 1,000 | Upload chunks submitted per ingestion invocation |
| `referenceConcurrency` | 4 | 1 to 16 | Assets processed concurrently within one reference invocation |
| `referenceItems` | 200 | 1 to 1,000 | Individual assets processed per reference invocation |
| `runTimeoutMs` | 7,200,000 | 60,000 to 43,200,000 | Lifecycle deadline after admission, in milliseconds |

The supported ranges are application guardrails, not demonstrated capacity. Each worker calculates its work budget as the [remaining invocation runtime reported by Forge](https://developer.atlassian.com/platform/forge/runtime-reference/app-context-api/) minus `finalizationBudgetMs`. This reserves time for checkpointing and continuation, accounts for invocation time already spent, and follows changes to the manifest timeout without duplicating its numeric value in the configuration schema. With the current 300-second worker timeout and 60-second reserve, the work budget is at most 240 seconds. If no processing time remains, the worker yields without starting more work. The configuration UI and import request entrypoints do not calculate a worker budget using their own shorter invocation deadlines.

Budget checks also reserve 25 seconds within that effective work budget before starting another request or group. Increasing a cap does not bypass those checks or change the 20-second request timeout. Storage batches remain limited to 25 keys, upload payload sizes are unchanged, and installation-wide import concurrency stays at one.

Larger ingestion batches avoid a queue delivery between every upload chunk. Larger reference batches can also reduce queue deliveries when the item cap is reached before the time budget. They do not reduce individual asset reads, account searches, email confirmations, or writes. Reference concurrency changes how many of those sequences can overlap and must be evaluated against observed HTTP 429 responses and backoff. Increase one setting at a time and compare phase durations, chunks submitted, asset attempts, invocation durations, and queue lag using the same representative workload. Raising a cap has no benefit once elapsed time is already causing the yield.

The current two-hour lifecycle default is shorter than the rough forecast for an initial 50,000-account association at concurrency four. A full-scale trial must choose a suitable lifecycle deadline and measure both initial association and ordinary twice-daily candidate sets. Increasing that deadline allows more work to complete and does not increase throughput.

See [development tuning instructions](DEVELOPMENT.md#tune-import-processing) for changing the code defaults and redeploying.

## KVS layout

Live data uses the `user-reference:live:` root and test data uses `user-reference:test:`. Every namespace includes workspace and import source IDs. The one installation-wide admission key is `user-reference:active`.

| Data | Key suffix / access |
| --- | --- |
| Run manifests | `manifest:<workspace>:<source>:<run>`. Scan compact metadata only |
| Inventory pages | `run:<workspace>:<source>:<run>:inventory:<index>`. Bounded asset-ID lists |
| Page descriptors | `page-meta:<workspace>:<source>:<run>:<index>`. Index, key, count |
| Work/results | `run:<workspace>:<source>:<run>:asset:<asset>`. Direct/batch reads via inventory |
| Pending retries | `pending:<workspace>:<source>:<partition>:<asset>`. Compact diagnostic state |
| Completed summary | `summary:<workspace>:<source>:<execution>`. One direct read |
| Recovery floor | `recovery:<workspace>:<source>:`. Earliest unfinished selection timestamp |

Run IDs include request time and a UUID. Execution IDs are recorded when available. Before execution creation, a failed request's summary uses its run ID. The summary helper derives the exact key.

Inventory pages are staged before work writes and sealed before their manifest checkpoint advances. Work items record their owning inventory page so repeating a partially written page preserves deduplication. Batch reads/writes/deletes use at most 25 keys and check partial results. Cleanup derives work keys from inventories without reading result values. Inventory data is removed only after the work deletion checkpoint is durable.

Atlassian's [KVS query documentation](https://developer.atlassian.com/platform/forge/storage-reference/kvs-api-query/) warns against persisting opaque cursors. Retry keys therefore use 256 SHA-256 partitions. Discovery checkpoints the partition number, uses cursors only within an invocation, and can repeat an interrupted partition through the same deduplication mechanism. Compact manifest scans also keep cursors within an invocation. Retention checkpoints explicit obsolete run keys and page offsets. No value scan acts as a key-only listing.

Retries and unfinished work have no upload-style TTL. Retention keeps the current run and the two most recent preceding runs, including summaries, descriptors, inventories and detailed outcomes. Pending retries survive pruning. Source deletion removes pending retries independently of report retention.

## Status and observability

Completed summaries are bounded independently of user count. They contain IDs, terminal status (`success`, `with_errors`, or `failed`), timestamps, total/per-phase durations and separately measured retention time, selected/unfinished counts, aggregate outcomes, fixed reason counts, effective tuning settings, and a details prefix. `selectionComplete: false` explicitly identifies an interrupted search whose unseen remainder cannot be counted. A summary is persisted before admission is released. Logs contain IDs, counts, status codes and reason codes, without identity fields or response payloads.

The summary also records admission wait. Phase timing starts with the queued request. Each finished invocation emits one structured `IMPORT_METRICS` summary with API/KVS calls by phase, queue delivery lag, discovery/retry counts, continuations, and response errors. Reference processing adds counts of newly finalized outcomes and unresolved reasons after their detailed work records have been persisted. Results reused from earlier invocations have a separate counter. A budget exit or caught failure still emits its partial invocation summary. Outcome and reason maps are always present and use fixed enums, so log size stays bounded as item count grows. An invocation with no outcomes emits empty maps. Per-asset diagnostics remain in retained work entries and pending records.

`IMPORT_SUMMARY` logs add input/checkpoint counts and correlate completion to the upload. Metrics remain separate from authoritative processing checkpoints and do not add storage writes. See [performance evidence collection](DEVELOPMENT.md#collect-lifecycle-performance-evidence) for the manual smoke report and interpretation limits.

The native import may finish before reference processing. Native history and its details dialog are not extended, and `importStatus` continues to describe configuration readiness. No report UI, reporting endpoint, manual retry action, or notification channel is added. A later full import retries pending associations automatically.

## Validation and deployment

Run `npm run build`, `npm test`, the applicable Biome checks, and MCP `forge_lint`, then deploy development through MCP. The new `read:email-address:jira` and `read:jira-user` scopes require an installation upgrade after deployment. The app's Jira identity also needs the API permissions for browsing users and updating the mapped Assets objects.

The scale fixtures exercise 7,000 and 50,000 unresolved candidates over four runs with three retained reports, including deduplication, direct summary reads, partial failures, budgets, and pruning without reading outcomes for key discovery. They measure serialized bytes and storage requests, not cloud latency. The ordinary-run target remains a few minutes. Initial association and a large unresolved backlog are heavier workloads whose live duration has not been established.

For live verification, use the dedicated Smoke Test source and `FORGE_SMOKE_USER_EMAIL` with an existing Jira account. The smoke test independently reads the stored account's email, repeats the identical full import, asserts that asset's `Updated` timestamp is unchanged, and waits for reference completion before cleanup. Synthetic emails validate unresolved outcomes only. See [development setup](DEVELOPMENT.md).

The [2026-10-28 development smoke test](../ad_hoc/issue-2/user-reference-sync.validation.md) satisfied its original assertions against Forge version `6.0.0`, including association, unresolved-outcome counts, identical re-import, and cleanup. It did not verify the unresolved reasons or collect phase timing evidence. The stricter test now requires `unmatched` reasons and gathers timing evidence. Its two-import handoff took 5 minutes 55 seconds including prompts and polling. Production-scale timing remains unmeasured.

### Mocked unresolved-backlog measurements

Measured on 2026-10-28 with `reference-scale.test.ts`, using four full unresolved runs (caps 20, 100, 1,000, then 100) and retaining three. These fixture measurements cover application KVS calls and JSON value bytes, without network latency or product API traffic. They are not Forge billing measurements. Timing metadata can change byte totals between runs.

| Candidates per run | Retained asset/retry keys | Inventory pages + descriptors | Total keys | Value bytes read across four runs | Value bytes written across four runs | KVS calls across four runs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 7,000 | 28,000 | 3,354 | 31,360 | 8,301,362 | 21,063,724 | 153,320 |
| 50,000 | 200,000 | 18,774 | 218,780 | 60,691,334 | 144,719,726 | 1,059,013 |

Each completed summary serialized to less than 2 KiB. The all-unresolved scenario creates many retry-discovery pages as well as AQL inventory pages. This metadata overhead is included above. Normal imports with a small candidate set need less work, but even empty retry partitions require queries. Live latency, throttling, and account-resolution costs still need measurement before making a cloud completion-time claim.
