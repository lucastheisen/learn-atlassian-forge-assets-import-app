# Populate Assets User attributes after import

Tracked in [issue #2](https://github.com/lucastheisen/learn-atlassian-forge-assets-import-app/issues/2).

## Context and upstream status

The native import mapping omits User attributes from `schema-and-mapping`, so the app cannot map incoming email addresses to those attributes.
Issue #2 and its July 17 comment record the same failure for both this Forge import source and native External Import, including an `UNKNOWN_EXTERNAL_ID_MAPPING` rejection when trying to add the mapping manually.

Checked on 2026-10-27.

- [JSDCLOUD-10732](https://jira.atlassian.com/browse/JSDCLOUD-10732), support for User attributes in External/Discovery imports, is still unresolved. Atlassian's stated workaround is to import first and update the User attributes afterward.
- [JSDCLOUD-10487](https://jira.atlassian.com/browse/JSDCLOUD-10487), email-based User attribute imports, is marked fixed. That does not establish support for this app's import surface. The repository already records contrary live results.

A read-only live check on 2026-10-27 confirmed the limitation on the dedicated native External Import source `5a133a70-ea3f-4cfc-b632-69eb10ebf5a1`.
The general Assets API exposes `Atlassian User` on `Smoke User` (object type ID `169`) as a User attribute (`type: 2`), but that attribute is absent from the import source's `schema-and-mapping` response.
The check made no mapping changes and did not repeat the earlier mapping-write rejection test.
This confirms that native External Import still cannot expose the User attribute for mapping on the tested source, supporting the need for post-import processing.

## Proposed outcome

After a successful native import, populate the target Assets User attribute with matching Atlassian account IDs.
Each import contains the full user dataset. Assets creates new objects, updates changed objects, and leaves identical objects alone.
The current population is approximately 7,000 users. Design for growth to 50,000.
Run the process twice daily, aiming for completion within a few minutes per regular run.
The existing, different implementation takes approximately three minutes for 7,000 users. Use that as a comparison point, with cloud performance to be measured.
Query the resulting Assets user objects for changes since the import started or an empty User reference.
Read lookup fields from those objects, without retaining or replaying uploaded records for reference processing.
Use email-based user lookup for this learning project behind a single function interface that also supports a future SCIM-based implementation.

## Proposed approach

### Reuse the existing KVS idiom

Follow the project's existing separation of data, lightweight metadata, and manifests instead of introducing a second storage-management pattern.
In [`kv-upload.ts`](../../src/lib/kv-upload.ts), `writeUploadData` stores a data chunk separately from its small `{ index, key, count }` metadata entry. `writeUploadComplete` scans that metadata prefix to assemble an explicit manifest.
In [`kv-data.ts`](../../src/lib/kv-data.ts), `getImportData` follows a manifest entry to read one known data key, and `prune` derives deletion keys from manifests rather than reading data payloads to discover them.

Apply that idiom to reference synchronization.

- Separate prefixes for compact run manifests, run work/results, inventory-page metadata, pending retries, and completed summaries. Keep test data segregated as existing import manifests do.
- Small inventory-page descriptors contain an index, key, and count. Their data pages contain bounded asset-ID lists. A sealed run manifest indexes those pages and records totals and the summary key.
- Discover retained runs through the compact manifest prefix scoped to workspace/import source.
- Read work/results by the IDs in the indexed pages, and prune through recorded/deterministically derived keys.
- Store reference-specific types and lifecycle operations in a focused KVS library alongside `kv-data.ts` and `kv-upload.ts`. Retain existing generic mechanics in `kv-common.ts`.

Reuse [`kv-common.ts`](../../src/lib/kv-common.ts) helpers with their actual contracts.

- `iterateAllValues<T>` streams paginated full key/value results and wraps query failures. Use it for narrow scans that can finish within one invocation. It does not eliminate full-value reads.
- `getAllValues<T>` collects every result in memory. Reserve it for small, bounded metadata collections. Do not use it to load 50,000 work items or retry entries.
- `deleteAllValues` splits explicit keys into batches of 25 and returns successful/failed keys. Callers must inspect `failedKeys` and retain cleanup progress for failures, as `writeUploadComplete` does.

The existing private `nextPage` hides pagination cursors from callers. Expose or minimally extend this shared page operation for resumable scans, returning results and the next cursor so the run can persist its position between invocations.
The typed `getValue`/`setValue` wrappers in `kv-upload.ts` already use `DataAccessError` and SDK write policies. Extract those into the common library only if reference processing needs the same reusable behavior.
Reuse the staging-to-sealed-manifest and stable-key/idempotency patterns, while keeping reference-run semantics separate from upload-specific record validation and import-manifest publication.
Do not copy upload staging TTLs onto pending retries or unfinished reference work. Their lifetime follows recovery and the agreed run-retention policy.

### Candidate selection from Assets

Keep the existing native import mapping configuration.
Use code-defined conventions for the additional user association, including selection of the Assets email attribute and target User attribute.
Do not add settings or configuration UI for lookup or association rules.
Persisting processing results is an operational requirement. Report access is separate from import configuration.
Resolve environment-specific Assets IDs from metadata rather than hard-coding numeric IDs.

Record the execution's start time before starting the import and carry that fixed timestamp into reference processing.
After successful import completion, query the target user object type using the following predicate (the IDs and timestamp below are placeholders).

```text
objectTypeId = <user-object-type-id>
AND (Updated >= "<import-start>" OR "Atlassian User" IS EMPTY)
```

Use an inclusive lower bound, formatted for AQL with conservative timestamp precision, to avoid dropping changes at the boundary.
The timestamp remains fixed throughout pagination and retries.
The empty-reference branch includes older objects whose association previously failed, even when this import leaves their other attributes unchanged.
The AQL result is one candidate source. The durable retry set below supplies candidates whose prior association attempts failed despite an existing reference.

The query returns each target asset's ID and current attributes, so no additional match from an uploaded record to an asset is needed.
Pass the asset's lookup fields to the user lookup function and update that asset by ID.
Scope both branches of the predicate to the intended user object type.

Assets exposes an object-level `updated` timestamp and import-level execution history. A per-object last-imported timestamp is not documented in the reviewed API.
`Updated` reflects modifications from any actor, including manual edits and reference updates, so it selects possible changes rather than proving that an import changed an object.
Atlassian marked [JSDCLOUD-16762](https://jira.atlassian.com/browse/JSDCLOUD-16762), where identical imports incorrectly advanced object modification timestamps, as fixed.

This AQL predicate alone retries empty references, but does not recover every stale nonempty reference from previous failed runs.
For example, if an email changes in one import and replacing its existing User reference fails, the next identical import may leave the object outside this timestamp window.
The retry set retains that asset as a candidate independently of its `Updated` timestamp and current reference.
Neither mechanism detects an association that becomes incorrect solely through a directory change when the asset is unchanged and no failed attempt is recorded.

### Durable workset and retry state

Include a durable retry set in the first version, using the existing Forge KVS.
Build a durable workset for each execution before reference updates begin.
Build the deduplicated workset from both candidate sources.

- Assets returned by the updated-or-empty AQL predicate.
- Assets identified by pending retry entries for that workspace/import source.

Store one work item per asset under a deterministic execution/asset key, for example `user-reference:run:<workspaceId>:<importSourceId>:<executionId>:asset:<assetId>`.
Store only asset IDs/keys, processing state, outcome/reason codes, and attempt metadata. Read current identity and activity fields from Assets when processing.
Maintain bounded inventory pages containing asset IDs, with deterministic page keys and a page count in the run manifest.
Use small page descriptors and the sealed manifest to locate these pages, following the upload metadata/manifest idiom.
Persist inventory and discovery checkpoints recoverably so partial writes do not leave work items that cannot later be found or cleaned up.
Duplicate discovery of an asset must preserve an existing work item and its processing state.
Save discovery progress so an interrupted AQL scan or retry-prefix scan can resume.
Seal discovery only after both scans and all work-item writes have completed, recording the expected item count in the run manifest.
No reference updates begin before the workset is sealed.
This prevents our reference writes from changing the AQL result while it is still being paginated.

Maintain one pending retry entry per workspace, import source, and asset, under a key such as `user-reference:pending:<workspaceId>:<importSourceId>:<assetId>`.
Find these entries using a workspace/import-source prefix query, as the project already does for import manifests.
Keep this retry state separate from historical run retention and uploaded data.

Process each work item as follows.

1. Read its current authoritative asset data. If the asset is confirmed deleted or its imported activity attribute marks the user inactive, remove any pending retry entry and record that disposition. Leave existing User references unchanged.
2. If this run already has a terminal result for the item, reuse that result without another logical attempt.
3. Otherwise, persist pending retry state before lookup or a reference update. Remove it after successful association or confirmation that the existing reference already matches. Retain it with diagnostic metadata for unresolved outcomes and failures.
4. Persist the work item's outcome. Completion aggregation uses these stored outcomes rather than incrementing counters on every queue delivery.

An unmatched or inactive Jira account does not establish that the authoritative asset user is inactive.
Unknown asset activity and temporary asset-fetch failures retain retry state and produce diagnostic outcomes.
If the Assets write succeeds but saving the result or clearing retry state fails, a retry can confirm the current reference and repair the stored state without another Assets write.
Failure to persist required recovery state prevents the item from being treated as complete.
Retries must be bounded within a run. Unresolved entries remain available to subsequent full imports.

Pending retry entries survive historical-report retention and upload pruning, and are cleaned up when their import source is deleted.
Superseded workers must not overwrite or clear state belonging to newer work.
An interrupted discovery/processing run retains its progress and original timestamp. Pending entries alone do not represent candidates that discovery never reached.

### Completion and processing

Allow only one app-managed import lifecycle in flight at a time per installation.
Exclusivity covers starting the native import, native processing, candidate discovery, reference synchronization, and persisting the final run result and retry state.
Native `DONE` does not release the active run while reference processing is still in progress.
All import entrypoints must share durable, atomic admission control. Checking a flag and later setting it is insufficient to prevent simultaneous starts.
Defer later start requests until the active lifecycle reaches a terminal outcome, using durable continuation rather than blocking a function while it waits.
Cancellation and terminal failures must preserve unfinished recovery work and prevent old workers from making further changes before another run starts.
Recover admission state after crashes/timeouts so an abandoned run neither overlaps its successor nor leaves imports permanently blocked.

The current worker sends the final chunk with `completed=true`. Assets then imports asynchronously.
Start a separate delayed queue after that submission succeeds.
Poll the specific execution until its terminal outcome is known, with bounded waiting.
Confirm the API's actual success/error response shape before implementing the success gate.
Do not update references for cancelled or failed imports.

After sealing the workset, process work items within an elapsed-time budget and a secondary item-count cap.
Persist each item's result before advancing its checkpoint.
Treat 20, 100, or 1,000 items as tuning candidates. Choose the initial cap from measured request latency and throughput rather than requiring an invocation to finish a fixed item count.
Bound request concurrency independently of the item cap. Allowing 1,000 items per invocation does not imply starting 1,000 simultaneous requests.

Keep tuning in the shared application `Config` model, with validated hardcoded defaults for the first version.
Use the same configuration path for the existing configuration resolver and import creation.
Capture the effective tuning settings in each request so later configuration changes do not alter an active lifecycle.
Defer tuning persistence and UI controls, which can extend this same model later.

Configure `timeoutSeconds` explicitly for the reference-sync consumer and stop admitting new work before that deadline.
Calculate the worker budget from the actual remaining invocation runtime reported by Forge minus `finalizationBudgetMs`, which defaults to 60,000 milliseconds.
Reserve time to finish bounded in-flight work, persist outcomes/checkpoints, and enqueue and await the next invocation.
Check the remaining budget before each unit of work, including API pagination and retries inside user lookup.
Bound request attempts and backoff against that budget. If a rate-limit delay exceeds the remaining budget, persist progress and schedule a delayed continuation.
Checking elapsed time only between assets is insufficient if one asset's lookup or update can consume the remaining runtime.
Use supported request timeout/cancellation mechanisms where available, and retain durable pending state for interrupted or uncertain writes.
Do not use an unawaited background request or a timeout race as evidence that an Assets write was cancelled.

The same budget/checkpoint/continuation behavior applies to candidate discovery, result aggregation, and retention cleanup.
Await the queue push before returning. Enqueue failure must remain recoverable from the stored workset and checkpoint.
Carry work identifiers and checkpoints through the queue rather than the entire candidate dataset.
Ensure duplicate delivery and retries can safely repeat unfinished work.
Reference processing must not depend on upload manifests or chunks remaining in KVS after the native import.

Current [Forge invocation limits](https://developer.atlassian.com/platform/forge/limits-invocation/) give async consumers a default 55-second timeout, configurable up to 900 seconds when the function is used only by async consumers or scheduled triggers.
The permitted maximum is not the processing budget. Choose a shorter internal deadline with a measured safety margin.
Unexpected hard timeouts remain recoverable failures, rather than the normal way to advance work.

After processing, aggregate the stored work-item outcomes in bounded pages.
Verify that the expected number of items is present and every item has a terminal result before reporting completion.
Missing items or unfinished processing must not produce a successful report.
This also prevents incomplete reads during aggregation from silently undercounting work.

Import-source deletion must stop its outstanding work and clean up its operational state safely.
A latest-execution check alone is insufficient to enforce the required exclusivity.

### Storage sizing and retention

Retain results for at most the three most recent runs per workspace/import source, including the current run.
A run consists of its manifest/summary, indexed inventory pages, work-item outcomes, and bounded discovery/processing checkpoints.
Prune older run namespaces, preserving pending retry entries and transferring any still-required recovery work before removing its only durable record.
Run retention must not discard a known failed association simply because its originating run is old.

The current [KVS limits](https://developer.atlassian.com/platform/forge/limits-kvs-ce/) do not document a fixed total-key count cap. Relevant constraints include a 240 KiB value limit and request/throughput limits.
[Batch operations](https://developer.atlassian.com/platform/forge/storage-reference/kvs-batch/) accept at most 25 keys. Split storage requests into groups within that limit independently of the invocation's item cap, and handle partial failures before advancing checkpoints.
Use compact metadata and batch operations where appropriate rather than storing user records or one growing result array.

KVS prefix queries return full key/value entries, without a key-only listing or value-field projection in the documented [query API](https://developer.atlassian.com/platform/forge/storage-reference/kvs-api-query/).
Treat every scan as a read of all returned values, including scans performed for discovery, aggregation, or cleanup.
Design access paths accordingly.

- Query only the compact run-manifest prefix to discover retained runs, then follow manifest references to summaries and indexed inventory pages, using the existing manifest discovery/pruning pattern.
- Read work items through the sealed run's paged asset-ID inventory and known processing checkpoint. Avoid scanning already completed work from the beginning on each invocation.
- Scan only the narrow pending-retry prefix when merging prior failures. Those entries contain the compact retry metadata needed by that operation.
- Aggregate compact outcome values once during finalization, with resumable aggregation progress so continuation does not restart the entire scan.
- Prune using inventory pages to derive work-item keys and delete those keys directly in batches. Cleanup need not read each work item's value just to discover its key.
- Read the completed summary directly for future overall-status presentation. Read detailed outcomes only when their contents are needed.

Inventory pages and their metadata/manifests add their own storage and write overhead. Include them in measurements.
Measure value bytes read and written as well as key counts and API-call counts, including discovery, resumed processing, aggregation, and three-run pruning.

For three similarly sized worksets of N candidate assets and F unresolved retry entries, this model needs approximately `3N + F` asset keys plus run/checkpoint metadata.
This is a sizing estimate, not a claim that every installation or workload fits without measuring storage and operation use.
Capacity planning must cover an initial association or recovery run where the entire population becomes a candidate, as well as ordinary runs with fewer changed, empty, or pending associations.

| User assets, all selected | At 20 items/invocation | At 100 items/invocation | At 1,000 items/invocation | Asset-result keys for three full runs |
| --- | --- | --- | --- | --- |
| 7,000 | 350 | 70 | 7 | 21,000 |
| 50,000 | 2,500 | 500 | 50 | 150,000 |

Invocation counts are arithmetic comparisons assuming each invocation finishes the stated count, excluding discovery, aggregation, cleanup, and retries.
They do not establish that any given item count can finish within the runtime budget. Slower requests or rate limiting require more invocations.
The result-key counts exclude pending retry entries and run/checkpoint metadata.
For example, 50,000 unresolved assets would add 50,000 pending keys to three full retained worksets, for approximately 200,000 asset-related keys overall.
Use measured serialized record sizes and storage/API operation counts to assess this model at those volumes.
A work batch still makes individual product API requests. The item cap is not a product API batching guarantee or a completion-time estimate.
Aim for a few minutes from import start through final reference-sync status persistence on regular twice-daily runs.
Measure native import, discovery, lookup/update, aggregation, and cleanup durations separately, along with total duration.
Compare the measured 7,000-user duration with the existing implementation's approximately three-minute runtime, and establish the cloud duration at 50,000 users.
Initial association and large retry backlogs may be heavier than regular runs. Report measured differences rather than claiming a completion time from item counts or mocked tests.

### Replaceable user lookup

Expose account resolution through a single function interface that is the contract used by queue processing and Assets updates.
The interface accepts lookup fields from an Assets user object and returns an Atlassian account ID or an unresolved outcome with a diagnostic reason. API failures remain distinguishable from lookup outcomes.
Implementations may use helper functions, objects, or other internal structure as appropriate.
Callers depend only on this contract, allowing a second implementation to use SCIM source data and employee number without changing the queue or Assets update logic.

The initial implementation reads the asset's email, searches Jira, and verifies candidate emails exactly through the email API.
It owns source-field selection, pagination, profile visibility, email normalization, and inactive-account handling.
Do not trust the first suggested search result.

The lookup implementation is selected in code.
Do not introduce a provider registry, runtime selection, configurable identity mappings, or a SCIM integration.
A future implementation may use employee number, but this project does not need SCIM-provisioned users or simulated employee-number mappings to test its initial email lookup.

### Assets updates

Each user asset must associate with a single Atlassian user account.
The target User attribute must have maximum cardinality `1`. Validate this before processing and report incompatible schema configuration as an error.
An unresolved association may be empty, but a successful association always contains exactly one account ID.

The incoming asset data is authoritative for the user association.
Update a candidate asset when exactly one eligible account is confirmed.
Treat missing or blank identity data, unmatched users, and ambiguous matches as association errors.
Leave affected assets unmodified by reference synchronization, including preserving any existing User reference.
Record the actual diagnostic outcome without assuming whether the asset source or user directory is stale or incorrect.
Update only the target User attribute with the resolved account ID.
When the resolved account differs from the existing reference, replace that reference with the resolved account.
Skip the write when the existing reference already matches, avoiding unnecessary changes to `Updated`.

Identify the minimum scopes and API permission checks required by the agreed design.
Email confirmation requires `asApp` and `read:email-address:jira`. User search requires an appropriate Jira user-read scope.
Adding scopes requires deployment followed by installation upgrade.

### Observability and recovery

Track reference processing separately from the native execution's `DONE` state.
Persist a run result associated with the workspace, import source, and execution ID, including start/completion times, progress, and outcome counts.
Distinguish a running job, successful completion, completion with association errors, and failure to finish processing.
A run with unresolved associations must not report clean success, even if the native import succeeded.
Continue processing other candidates when an individual asset has a lookup/data error, then include those errors in the completion result.

Log each affected asset's ID/key, execution ID, and reason code so operators can locate the record without logging names, emails, payloads, or headers.
Retain per-asset diagnostic outcomes with the run result so errors can be inspected after completion without relying solely on Forge logs.
Use aggregate counts and codes for the completion summary. Retries must not inflate counts or create duplicate error entries.

Persist the completed run's summary as one KVS value at a deterministic key, such as `user-reference:run:<workspaceId>:<importSourceId>:<executionId>:summary`.
Include run identifiers, terminal status, start/end times, duration, aggregate outcome counts, counts by a fixed set of error reason codes, and the prefix for that run's per-asset details.
A future presentation or notification that knows the run ID can retrieve its overall outcome with one key read.
Keep per-asset outcomes and retry entries separate. The summary contains no unbounded list of affected assets or user data.
Validate the serialized summary size against the KVS value limit, keeping its structure bounded independently of whether a run processes 7,000 or 50,000 users.
Write the complete summary after aggregation has been verified and await persistence before releasing the active import lifecycle.
If processing terminates before all items finish, persist a failure summary that explicitly includes unfinished work rather than claiming successful completion.
Summary persistence must be retryable without duplicating outcomes or losing pending recovery work.
Retain each summary with its run's other results under the three-run retention policy.

The documented Forge [Assets import type module](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-service-management-assets-import-type/) exposes the app configuration dialog, but no extension point for adding fields to the native import-history details dialog.
Its `importStatus` hook accepts only `READY` or `NOT_CONFIGURED`, describing configuration readiness rather than this processing outcome.
Atlassian's [async import tutorial](https://developer.atlassian.com/platform/forge/queue-events-with-async-events-api-to-import-assets/) explicitly limits `/history/failed` to the `INGESTING` phase. It cannot record post-import association failures after native processing begins.
The design therefore needs an app-owned processing result rather than relying on augmenting the native history or details dialog.

Use the existing native full-import completion behavior for the first version.
The current app submits the final data chunk and lets Assets own native completion/status. It contains no custom email, webhook, or other completion notification implementation.
Add no new notification channel or recipients as part of this feature.
Native completion may precede reference-sync completion, and its details/status cannot be assumed to contain the retained association report.

Do not put import reports in the configuration screen.
Persist run status, summaries, and per-asset outcomes for the agreed three-run retention window.
Defer report presentation, retrieval interfaces, and additional notifications to a later decision. Add no report UI or new reporting endpoint in the first version.

The next full import automatically includes pending retries.
Provide no separate manual-retry UI or command in the first version.
Use bounded automatic retries for transient failures during processing, retaining unresolved work for later full imports.

## Implementation sequence after agreement

1. Verify relevant Assets/Jira response contracts and finalize authorization, candidate selection, and failure policies.
2. Build reference-run storage using the existing metadata/manifest idiom and shared KVS helpers, with minimal extensions for resumable paging where needed.
3. Define the user lookup function contract, add its email-based implementation, and add narrowly scoped Assets updates.
4. Integrate bounded completion polling and paginated Assets reference processing with the import lifecycle, including the durable workset and retry set.
5. Add status/recovery behavior and safe operational logging.
6. Update documentation and add focused tests for the agreed behavior.
7. Build, test, lint, deploy to development, upgrade the installation if required, and perform the agreed live verification.

## Verification

- Preserve the existing upload lifecycle and native import mapping configuration.
- Test user lookup independently from queue processing and Assets updates.
- Verify that the lookup contract describes inputs, match outcomes, and failures independently of the email-based implementation.
- Verify that blank, missing, unmatched, and ambiguous identity data leave the asset unmodified, produce per-asset diagnostic outcomes, and prevent a clean-success completion result.
- Verify that per-asset lookup/data errors allow other candidates to finish and remain visible in the run result.
- Verify that logs and reports identify affected records using asset IDs/keys without source personal data or payload dumps.
- Test aggregation from stored outcomes and accurate counts under queue retries, duplicate delivery, incomplete reads, and interrupted processing.
- Verify that a single summary-key read returns the terminal outcome and counts, that summary size remains bounded at 50,000 candidates, and that failed summary writes prevent releasing a falsely completed run.
- Verify queue and Assets update tests can substitute a lookup result without exercising Jira search.
- Test successful completion, failure, cancellation, delayed completion, and bounded polling.
- Test simultaneous starts across import entrypoints and verify exclusivity through native completion, reference processing, and final status persistence. Cover deferred starts and recovery from cancelled, failed, or interrupted runs without overlapping writes.
- Test candidate selection for newly created and changed objects, older objects with empty references, and unchanged objects with populated references.
- Test that an unchanged asset with a populated but stale reference is retried after an earlier failed replacement, and that overlap with AQL candidates produces one logical attempt per run.
- Test pending-entry cleanup for authoritatively inactive or deleted assets and current-run successes. Verify that failed lookups and uncertain activity retain pending work.
- Test pending-state persistence before attempts, recovery after interruption or a successful write followed by failed cleanup, retention independent of run reports, and protection from superseded workers.
- Test inclusive timestamp boundaries and AQL timezone/precision handling.
- Verify that an identical full import leaves existing object modification timestamps unchanged on the dedicated development source.
- Verify that discovery seals the deduplicated AQL/retry workset before reference updates begin and that changed `Updated` values do not alter the sealed workset.
- Test time-budget exits with fast, slow, and stalled API calls, multi-page lookups, rate-limit delays, and storage/queue failures. Verify durable progress, safe continuation, bounded in-flight requests, and no completion report for unfinished work.
- Test exact email confirmation, pagination, hidden emails, inactive accounts, and duplicate/missing matches.
- Verify that the target User attribute enforces maximum cardinality `1` and that every successful association writes exactly one account ID.
- Test updates by queried asset ID, changed emails replacing existing references with the uniquely resolved account, matching references requiring no write, and protection of unrelated attributes.
- Test retries, duplicate queue delivery, partial storage-batch failures, superseding imports, and independence from upload retention.
- Test retention of only the latest three run namespaces while preserving older unresolved retry work.
- Verify that run discovery reads only compact manifests and retention cleanup derives item keys from indexed inventory pages without reading per-asset result values. Include partial inventory writes and resumed aggregation/processing when measuring full-value reads.
- Extend the existing KVS helper tests only for newly required behavior, including resumable page access, and reuse their pagination, 25-key delete batching, and partial-failure coverage. Verify that reference cleanup inspects and preserves failed deletions rather than assuming that a returned batch result means complete success.
- Exercise discovery, deduplication, time-bounded processing, aggregation, retry retention, and pruning with 7,000- and 50,000-candidate fixtures and stubbed product API calls. Compare item caps of 20, 100, and 1,000 under varied latency, include an all-unresolved case, and measure serialized storage and operation counts across three retained runs.
- Record total and per-phase live durations on the dedicated development source, distinguishing ordinary full imports from initial association and retry-heavy runs. Treat the few-minute goal and existing three-minute comparison as performance targets, not established cloud results.
- Preserve native import completion behavior and verify that no custom notifications or manual-retry action are added.
- Run type checks, the test suite, builds, applicable lint checks, and Forge lint.
- Verify on a dedicated development source using a known Jira account and explicit reference assertions. Synthetic smoke-test emails do not verify account resolution.
- Ensure smoke cleanup waits for reference processing when enabled.
- Confirm live invocations use the newly deployed version before treating them as implementation evidence.

## Out of scope unless agreed otherwise

- Adding CI workflows.
- Changing the upstream import schema or attempting to force unsupported User mappings into it.
- Clearing references for unmatched users or synchronizing group membership.
- Configurable user lookup, additional association configuration UI, and SCIM integration.
- Report presentation/retrieval interfaces, custom completion notifications, and a manual-retry UI/command.
- Production deployment or installation changes.

## References

- [Issue #2 and reproduction findings](https://github.com/lucastheisen/learn-atlassian-forge-assets-import-app/issues/2)
- [Repository investigation](../../docs/NOTES.md#updating-reference-to-atlassian-user)
- [Shared KVS helpers](../../src/lib/kv-common.ts)
- [Import manifest reads and pruning](../../src/lib/kv-data.ts)
- [Upload metadata and manifest lifecycle](../../src/lib/kv-upload.ts)
- [Existing external import reproduction](repro_external_import_user_attribute.sh)
- [Assets object REST API](https://developer.atlassian.com/cloud/assets/rest/api-group-object/)
- [Assets AQL syntax](https://support.atlassian.com/assets/docs/use-assets-query-language-aql/)
- [Import execution history](https://support.atlassian.com/assets/docs/view-process-results/)
- [Forge Assets import type module](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-service-management-assets-import-type/)
- [Async import tutorial and failure-history limitations](https://developer.atlassian.com/platform/forge/queue-events-with-async-events-api-to-import-assets/)
- [JSDCLOUD-16762. Unchanged imports advancing modification timestamps](https://jira.atlassian.com/browse/JSDCLOUD-16762)
- [Jira user search API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-user-search/)
- [Jira user email APIs](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-users/)
- [Forge async events](https://developer.atlassian.com/platform/forge/runtime-reference/async-events-api/)
- [Forge invocation limits](https://developer.atlassian.com/platform/forge/limits-invocation/)
- [Forge KVS limits](https://developer.atlassian.com/platform/forge/limits-kvs-ce/)
- [Forge KVS batch operations](https://developer.atlassian.com/platform/forge/storage-reference/kvs-batch/)
- [Forge KVS query API](https://developer.atlassian.com/platform/forge/storage-reference/kvs-api-query/)
