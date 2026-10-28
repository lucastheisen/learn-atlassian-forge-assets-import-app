# User references after import

The native import mapping still excludes User attributes. This app populates `Atlassian User` after a successful native import, using the current Assets objects as the authority for the association.

The native mapping must select the full user dataset with the `users` selector. Exactly one mapped object type must use that selector. That type needs `Email`, a Boolean `Active` attribute, and an editable User attribute named `Atlassian User` with maximum cardinality **1**. Numeric object type and attribute IDs are resolved from source/type metadata. These conventions are defined in code; there are no additional configuration controls.

`lookupUserByEmail` implements the `UserLookup` contract in `reference-types.ts`. It receives named asset fields and a processing budget, and returns either one account ID or an unresolved reason. API failures remain exceptions. A future implementation can use employee number and SCIM data behind this same interface. The queue and reference update code accept the lookup function independently of its implementation.

The email implementation normalizes surrounding whitespace and case, pages Jira user search, and confirms candidate emails through the app-only user email API. Only active Atlassian accounts are eligible. It rejects ambiguous matches and incomplete email confirmation rather than taking the first suggested account. Missing, malformed, unmatched, or ambiguous identity data preserves the existing reference and produces an unresolved result. A uniquely resolved different account replaces the existing reference. An already matching reference requires no write. Every write contains just the target attribute and one account ID.

## Lifecycle and recovery

Both the Assets module hook and the authenticated `import-start` command persist a request before enqueueing it. All native workers and reference workers use the installation-wide `import-lifecycle` concurrency key with limit 1. The consumer claims a durable admission key with `FAIL_IF_EXISTS`; subsequent requests defer until that lifecycle completes. The admission key has no expiry that could allow a successor to overlap a slow worker.

The lifecycle covers admission, ingestion, native processing, discovery, association work, aggregation, and summary persistence. It records the import start time before creating the native execution. Chunk IDs are deterministic so retrying ingestion does not introduce a new logical chunk. Recovery reconciles an execution created before its ID was checkpointed. Native completion is polled by execution ID, requiring `DONE`, a `FINISHED` progress result with `result: OK`, and no import/type errors before discovery can begin. `DONE` alone is insufficient. See the [Assets import workflow](https://developer.atlassian.com/cloud/assets/imports-rest-api-guide/workflow/).

Discovery selects the mapped object type with `(Updated >= import-start OR "Atlassian User" IS EMPTY)`, using an inclusive UTC timestamp rounded down to the minute. A failed or cancelled run preserves its earliest selection timestamp for the next full import, including candidates an interrupted discovery never reached. Discovery merges these assets with durable pending retries and seals the deduplicated inventory before any reference writes begin. Processing re-reads the current asset rather than replaying uploaded user data.

Each attempt persists pending recovery state first. Confirmed deleted assets and assets whose authoritative `Active` value is false remove pending retries without changing their reference. Unknown activity and lookup/update failures retain pending state. Inactive or absent Jira accounts do not make an asset inactive. A cleanup failure following a successful association resumes cleanup; an uncertain Assets write is re-read before another write is considered. Terminal results are reused on duplicate queue delivery, and aggregation reads stored outcomes instead of incrementing counters per delivery.

Workers have a 300-second Forge timeout and a 110-second internal budget. Product requests use a supported abort signal with a 20-second timeout, and budget checks apply inside lookup pagination and retries. The worker awaits requests and all in-flight items; it does not assume an aborted write rolled back. The initial processing cap is 100 items with at most four assets in flight. The cap is a secondary bound, not a promise to finish that count before yielding. Mocked latency fixtures cover 20/100/1,000-item caps; live throughput still needs measurement.

Rate limits defer work rather than sleeping inside the invocation. A durable not-before time preserves long `Retry-After` delays across queue deliveries. An asset gets at most three processing attempts per run; unresolved work remains pending for the next full import. Native processing exceeding 30 minutes marks the run failed but retains admission until a terminal native state is observed. A two-hour lifecycle limit stops further reference attempts while preserving recovery state. Cancellation similarly waits for native processing to end if Assets has already left its cancellable ingestion phase.

The five-minute recovery trigger re-enqueues stored active and waiting requests if continuation delivery fails or retries are exhausted. Old events cannot mutate a successor's state: every worker must claim the same active run before doing work. Source deletion cancels work, waits for admission to be released, and removes its run and pending state. A short-lived deletion marker guards late deliveries.

## KVS layout

Live and test data use separate roots: `user-reference:live:` and `user-reference:test:`. Every namespace includes workspace and import source IDs. The one installation-wide admission key is `user-reference:active`.

| Data | Key suffix / access |
| --- | --- |
| Run manifests | `manifest:<workspace>:<source>:<run>`; scan compact metadata only |
| Inventory pages | `run:<workspace>:<source>:<run>:inventory:<index>`; bounded asset-ID lists |
| Page descriptors | `page-meta:<workspace>:<source>:<run>:<index>`; index, key, count |
| Work/results | `run:<workspace>:<source>:<run>:asset:<asset>`; direct/batch reads via inventory |
| Pending retries | `pending:<workspace>:<source>:<partition>:<asset>`; compact diagnostic state |
| Completed summary | `summary:<workspace>:<source>:<execution>`; one direct read |
| Recovery floor | `recovery:<workspace>:<source>:`; earliest unfinished selection timestamp |

Run IDs include request time and a UUID; execution IDs are recorded when available. Before execution creation, a failed request's summary uses its run ID. The summary helper derives the exact key.

Inventory pages are staged before work writes and sealed before their manifest checkpoint advances. Work items record their owning inventory page so repeating a partially written page preserves deduplication. Batch reads/writes/deletes use at most 25 keys and check partial results. Cleanup derives work keys from inventories without reading result values. Inventory data is removed only after the work deletion checkpoint is durable.

Atlassian's [KVS query documentation](https://developer.atlassian.com/platform/forge/storage-reference/kvs-api-query/) warns against persisting opaque cursors. Retry keys therefore use 256 SHA-256 partitions. Discovery checkpoints the partition number, uses cursors only within an invocation, and can repeat an interrupted partition through the same deduplication mechanism. Compact manifest scans also keep cursors within an invocation; retention checkpoints explicit obsolete run keys and page offsets. No value scan acts as a key-only listing.

Retries and unfinished work have no upload-style TTL. Retention keeps the current run and the two most recent preceding runs, including summaries, descriptors, inventories and detailed outcomes. Pending retries survive pruning. Source deletion removes pending retries independently of report retention.

## Status and observability

Completed summaries are bounded independently of user count. They contain IDs, terminal status (`success`, `with_errors`, or `failed`), timestamps, total/per-phase durations and separately measured retention time, selected/unfinished counts, aggregate outcomes, fixed reason counts, and a details prefix. `selectionComplete: false` explicitly identifies an interrupted search whose unseen remainder cannot be counted. A summary is persisted before admission is released. Logs contain IDs, counts, status codes and reason codes, without identity fields or response payloads.

The native import may finish before reference processing. Native history and its details dialog are not extended, and `importStatus` continues to describe configuration readiness. No report UI, reporting endpoint, manual retry action, or notification channel is added. A later full import retries pending associations automatically.

## Validation and deployment

Run `npm run build`, `npm test`, the applicable Biome checks, and MCP `forge_lint`, then deploy development through MCP. The new `read:email-address:jira` and `read:jira-user` scopes require an installation upgrade after deployment. The app's Jira identity also needs the API permissions for browsing users and updating the mapped Assets objects.

The scale fixtures exercise 7,000 and 50,000 unresolved candidates over four runs with three retained reports, including deduplication, direct summary reads, partial failures, budgets, and pruning without reading outcomes for key discovery. They measure serialized bytes and storage requests, not cloud latency. The ordinary-run target remains a few minutes; initial association and a large unresolved backlog are heavier workloads whose live duration has not been established.

For live verification, use the dedicated Smoke Test source and `FORGE_SMOKE_USER_EMAIL` with an existing Jira account. The smoke test independently reads the stored account's email, repeats the identical full import, asserts that asset's `Updated` timestamp is unchanged, and waits for reference completion before cleanup. Synthetic emails validate unresolved outcomes only. See [development setup](DEVELOPMENT.md).

The [2026-10-28 development smoke test](../ad_hoc/issue-2/user-reference-sync.validation.md) passed against Forge version `6.0.0`, including association, unresolved outcomes, identical re-import, and cleanup. Its two-import handoff took 5 minutes 55 seconds including prompts and polling; production-scale timing remains unmeasured.

### Mocked unresolved-backlog measurements

Measured on 2026-10-28 with `reference-scale.test.ts`, using four full unresolved runs (caps 20, 100, 1,000, then 100) and retaining three. These fixture measurements cover application KVS calls and JSON value bytes, without network latency or product API traffic. They are not Forge billing measurements; timing metadata can change byte totals between runs.

| Candidates per run | Retained asset/retry keys | Inventory pages + descriptors | Total keys | Value bytes read across four runs | Value bytes written across four runs | KVS calls across four runs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 7,000 | 28,000 | 3,354 | 31,360 | 8,301,362 | 21,063,724 | 153,320 |
| 50,000 | 200,000 | 18,774 | 218,780 | 60,691,334 | 144,719,726 | 1,059,013 |

Each completed summary serialized to less than 2 KiB. The all-unresolved scenario creates many retry-discovery pages as well as AQL inventory pages; this metadata overhead is included above. Normal imports with a small candidate set need less work, but even empty retry partitions require queries. Live latency, throttling, and account-resolution costs still need measurement before making a cloud completion-time claim.
