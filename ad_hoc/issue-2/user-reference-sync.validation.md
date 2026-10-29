# User reference synchronization validation

## Development smoke test (2026-10-28)

The operator deployed Forge version `6.0.0` to development and upgraded its existing Jira installation on `lucastheisen.atlassian.net`, granting `read:jira-user` and `read:email-address:jira`.

The manual handoff completed with `status=success`, `step=complete`, and `exit_code=0` against the dedicated Smoke Test source.

- Workspace `3380a6d2-092b-493a-a9dc-cf0c5197e23b`
- Import source `cec77afc-b27b-4556-bc6e-994816a6e98b`
- Upload/run marker `smoke-import-1793200012873`

The test uploaded 15 records in five chunks. It verified that one asset had exactly one User reference, independently confirmed that account's email through Jira, and checked that the summary contained 14 unresolved outcomes. Those cases were intended to be unmatched synthetic addresses, but this version of the test did not assert their reasons. An unexpected lookup error could satisfy that count. An identical full re-import passed the same checks and left the associated asset's `Updated` timestamp unchanged. Asset cleanup and test-upload pruning both succeeded.

The handoff started at `15:05:59Z` and finished at `15:11:54Z`, taking 5 minutes 55 seconds including interactive ID entry, both imports, assertion polling, and cleanup. The run marker dates the smoke runner itself to `15:06:52.873Z`, about 5 minutes 1 second before handoff completion. This does not establish the duration of one import or throughput at 7,000 to 50,000 users. Per-phase durations are persisted in run summaries and completion logs. They were not retrieved during this manual test. The cause of the delay remains unverified.

The initial native-status check could observe a preceding execution's `DONE`. The object checks were scoped to the unique run marker, and the reference checks required the newest app run for that upload to be complete and match the latest native execution. This live test preceded the stricter checks and timing instrumentation described below.

## Local validation

The final `npm run build` and `npm test` checks passed on 2026-10-28. All 129 tests in 16 files passed. Applicable Biome checks passed with ten existing `noExplicitAny` warnings in the shared KVS tests and one informational template-literal suggestion in the scale fixture. `git diff --check` passed. Forge lint reported no issues during the successful development deployment.

The implementation includes unit and scale fixtures covering recovery, admission, partial storage failures, bounded execution, lookup ambiguity, retained results, and privacy. The 7,000- and 50,000-record scale fixtures use mocked APIs and do not establish cloud performance. See [implementation behavior and storage measurements](../../docs/USER_REFERENCE_SYNC.md).

## Development smoke rerun readiness (2026-10-29)

The current implementation passed `npm run build`, all 157 tests in 21 files, the applicable Biome checks, and `git diff --check`. The report CLI also passed a local check using synthetic client and lifecycle-log fixtures. Producer tests validate emitted invocation logs and completed summaries against the shared Zod contracts consumed by the reporting scripts.

MCP Forge lint reported no issues, and MCP deployment of development version `6.2.0` succeeded. This deployment includes the polling visibility, lifecycle metrics, stricter unmatched-reason assertions, and shared-schema cleanup. The existing installation already has the required scopes.

The manual smoke handoff passed Bash syntax and ShellCheck checks. Its later live results are recorded below. Local fixtures and deployment success alone do not establish live timing or association correctness.

## Development smoke test (2026-10-29)

The manual handoff ran from `13:55:02Z` to `14:01:40Z` against development version `6.2.0`. Its client report identified upload `smoke-import-1793282104474` and recorded all functional steps as passed. These included one verified association, exactly 14 `unmatched` outcomes, zero association writes on the identical repeat, an unchanged associated asset timestamp, asset cleanup, and test-upload pruning. The client run took 357.359 seconds, including both imports and cleanup.

The handoff initially returned `status=failed` at `step=collect_metrics`, with `smoke_exit_code=0` and `metrics_exit_code=1`. Forge CLI verbose output contained 20 escaped copies of application log messages inside diagnostic JSON metadata. The report parser mistook those copies for malformed application records even though the actual formatted messages were present.

The local report parser was corrected to recognize application message framing and ignore the diagnostic copies. A regression test covers mixed verbose and formatted output, rejects verbose copies without actual application messages, and preserves rejection of malformed application records. Reprocessing the original client report and captured logs passed with two expected and observed run summaries, 18 invocation observations, and zero malformed records. The captured data came from the existing live run. The parser correction required no new app deployment or import execution.

| Observed phase | Initial import | Identical repeat |
| --- | ---: | ---: |
| Admission wait | 3.089 s | 1.172 s |
| Starting | 2.399 s | 1.945 s |
| Ingesting | 116.649 s | 131.217 s |
| Native completion polling | 8.929 s | 9.074 s |
| Discovery | 24.428 s | 24.946 s |
| Association processing | 9.578 s | 4.645 s |
| Aggregation | 1.600 s | 0.896 s |
| Finalizing | 0.155 s | 0.162 s |
| Total after admission | 163.814 s | 172.967 s |

The initial run selected 29 items. Fifteen came from current asset discovery, and 14 came from pending retries for assets deleted by an earlier smoke cleanup. It associated one current asset, recorded 14 unmatched identities, and removed the 14 deleted-asset retries. The repeat selected the 14 still-unmatched current assets. Both summaries reported zero lifecycle failures and zero unfinished work, with `unmatched` as their only association reason. Their `with_errors` status reflects those deliberate negative cases.

Ingestion worker invocations took approximately 2.1 to 3.5 seconds each, with observed delivery waits of approximately 13.7 to 29.4 seconds between the five chunks. This identifies queue delivery as a substantial part of ingestion wall time. Native completion polling duration does not isolate server compute time.

Retry discovery queried all 256 partitions in each run, including 244 and 242 empty results respectively. Discovery took approximately 25 seconds per run, a measurable fixed cost for this small fixture. These observations do not establish completion time at 7,000 or 50,000 users. Rejected KVS admission writes also appear in operation-error counters when an existing active key is successfully reconciled. They are distinct from the zero recorded lifecycle failures.

## Tunable batching validation (2026-10-29)

In response to the observed ingestion queue waits, workers now submit multiple upload chunks within an invocation. The default cap is 20 chunks. Each chunk retains its deterministic ID and independent checkpoint. The optional `IMPORT_TUNING` Forge variable also controls reference item count, reference concurrency, the internal work budget, and the lifecycle deadline. Settings are validated before a new request is persisted, captured in that request, and included in summaries and invocation logs. The documentation records defaults, supported ranges, and deployment commands.

All 187 tests in 22 files passed, including the existing 7,000- and 50,000-record scale fixtures. The build, applicable Biome checks, readability checks, and `git diff --check` passed. New coverage verifies multi-chunk completion, cancellation between chunks, deterministic retry of an uncommitted chunk, checkpointed continuation after a budget exit, bounded reference concurrency, stored item caps and lifecycle deadlines, settings snapshots, recovery of older requests, and rejection of invalid settings before queueing. The report CLI also successfully reprocessed the earlier captured smoke artifacts with the expanded schemas, retaining two observed summaries and zero malformed messages.

MCP Forge lint initially returned `status=user_action_required` with `reason=credentials_unavailable` and the recovery action `rbw unlock`. The MCP grant was still valid. After the operator confirmed the unlock, MCP Forge lint passed and development deployment `6.3.0` succeeded. No additional scopes or installation upgrade were required. The batching changes have not yet been measured in a new live smoke run. The earlier development `6.2.0` measurements above describe one-chunk-per-invocation ingestion and remain the comparison baseline.

## Processing caps and bounded logging (2026-10-29)

Both default caps are now 200. Ingestion counts uploaded chunks, while post-import User reference processing counts individual assets. Reference concurrency remains four and the internal work budget remains 110 seconds. An invocation yields early when its time budget requires it, so the larger cap does not imply a proportional reduction in queue deliveries. Existing requests preserve their captured settings.

Per-asset unresolved warnings have been replaced by outcome and reason counts in the existing single `IMPORT_METRICS` invocation summary. Counts are recorded after detailed results and retry-cleanup state have been persisted. Replayed completed results increment a separate reused-result counter. Partial progress is included when an invocation exits on its budget or catches an error. Detailed asset IDs, keys, reasons, and available HTTP statuses remain in KVS work and pending records. Completed-run summaries remain authoritative.

All 194 tests in 22 files passed, along with the build, applicable Biome checks, readability checks, and `git diff --check`. Fixtures containing 200 and 1,000 unmatched assets each emitted exactly one invocation log under 4 KiB, retained every detailed result and pending retry, and emitted no per-asset warning. Further tests cover partial batches, failed result persistence, reused results, isolated invocation counters, report aggregation, duplicate log retrieval, and older logs without outcome observations. The report CLI also reprocessed the previously captured live artifacts with zero malformed records.

MCP Forge lint passed and development deployment `6.4.0` succeeded. No installation upgrade was required. The new defaults and logging have not yet been measured in a new live smoke run.

## Larger smoke test readiness (2026-10-29)

The manual smoke fixture now supports a configurable user count, polling deadline, and required continuation evidence. The prepared test uses 250 users in six upload chunks, with one real account and 249 deliberately unmatched addresses, followed by an identical import. Report validation requires both imports to exceed the stored reference item cap, show at least two invocations attempting assets, keep each invocation within the cap, and account for all persisted outcomes and reasons. It also records the maximum serialized invocation metric size.

The generator now uses distinct chunk and record coordinates in names and synthetic addresses. Previously its ten-record spacing could collide when chunks grew. Object assertions query the total count instead of reading only the first 100 objects. Cleanup queries at most 20 remaining objects per request, deletes at most four concurrently within its request budget, awaits issued deletes before returning, and confirms an empty final query before reporting success or removing the timestamp baseline.

All 202 tests in 23 files passed, together with the build, applicable Biome checks, readability checks, and `git diff --check`. New coverage verifies the 250-user generator, a customized polling deadline, counts beyond 100, complete cleanup across 250 objects, bounded cleanup concurrency, partial failures and budget exits, and positive and negative continuation-report cases. The report CLI also reprocessed the earlier captured artifacts successfully. The handoff passed Bash syntax and ShellCheck checks, plus mock-only checks of success, functional-failure, and metrics-failure result files.

MCP Forge lint passed and development deployment `6.5.0` succeeded. No installation upgrade was required. The prepared live 250-user smoke test has not yet been run. It checks continuation and the unmatched path with one real account association. It does not establish throughput for hundreds of successful matches and writes, and its six chunks do not cross the ingestion chunk cap.

## Development 250-user smoke test (2026-10-29)

The manual handoff completed successfully from `16:46:27Z` to `16:53:00Z` against development `6.5.0`, with functional and metrics exit codes both zero. Upload `smoke-import-1793292390102` contained 250 distinct users in six chunks. Rebuilding the report from the captured client data and Forge logs passed again and reproduced the handoff report exactly. Coverage included both expected run summaries and 11 invocation observations, with zero malformed records.

The initial execution was `35977ee7-7fc5-488d-8626-6871710428fa`, and the identical repeat was `9825c950-6482-49f8-b13e-b62ec0b718bf`. Both recorded caps of 200 upload chunks and 200 reference items, concurrency four, a 110-second work budget, and a two-hour lifecycle limit.

| Check | Initial import | Identical repeat |
| --- | ---: | ---: |
| Input records | 250 | 250 |
| Checkpointed upload chunks | 6 | 6 |
| Chunks submitted per ingestion invocation | 6 | 6 |
| Reference attempts per processing invocation | 200, 64 | 200, 50 |
| Selected assets | 264 | 250 |
| Updated references | 1 | 0 |
| Unchanged references | 0 | 1 |
| Unmatched identities | 249 | 249 |
| Deleted retry assets | 14 | 0 |
| Lifecycle failures | 0 | 0 |
| Unfinished work | 0 | 0 |
| Largest serialized invocation metric | 2,022 bytes | 1,954 bytes |

The first run included 14 pending retries for assets deleted by an earlier smoke cleanup. Their confirmed absence removed those retries. They account for the extra selected assets and 14 observed HTTP 4xx responses. Both imports had `unmatched` as their only unresolved reason. Their `with_errors` status therefore reflects the deliberately negative synthetic identities. Observed outcome and reason totals matched the persisted summaries. No HTTP 429, HTTP 5xx, or network-error counts were observed.

Both runs crossed the reference item cap and completed in two processing invocations without exceeding 200 attempts or outcomes in either invocation. The longest observed invocation took 82.184 seconds. Each ingestion worker submitted all six upload chunks in one invocation. No per-asset unresolved warning messages appeared in the captured logs. The existing metrics summaries contained bounded outcome and reason maps.

| Observed phase | Initial import | Identical repeat |
| --- | ---: | ---: |
| Admission wait | 2.947 s | 0.675 s |
| Starting | 4.669 s | 4.103 s |
| Ingesting | 40.835 s | 29.224 s |
| Native completion polling | 9.564 s | 9.505 s |
| Discovery | 26.742 s | 48.959 s |
| Association processing | 50.551 s | 51.153 s |
| Aggregation | 2.820 s | 10.089 s |
| Finalizing | 0.165 s | 0.143 s |
| Total after admission | 135.420 s | 153.255 s |

The full client test took 387.422 seconds, including both imports, upload, assertion polling, 82.975 seconds of asset cleanup over 14 requests, and successful test-upload pruning. Independent email confirmation passed, the identical repeat made no association writes, and the associated asset's `Updated` timestamp remained unchanged. Cleanup confirmed an empty final object query.

The ingestion delivery waits were 26.049 and 16.859 seconds, followed by worker durations of 15.056 and 12.632 seconds. The reference continuation delivery waits were 1.608 and 1.812 seconds, each including the requested one-second delay. Discovery on the repeat read 249 pending entries across 256 partitions, compared with 14 pending entries on the first run. That larger retry inventory added work alongside the 250 AQL candidates.

The earlier 15-user fixture spent 116.649 and 131.217 seconds in ingestion, compared with 40.835 and 29.224 seconds here. This run confirms multi-chunk ingestion and bounded reference continuation. The fixtures differ in workload and execution conditions, so this is not a controlled throughput comparison. Only one real account association was exercised, and completion time for 7,000 or 50,000 successfully matched users remains unverified.

## Shared application configuration (2026-10-29)

The existing `Config` contract now lives in `src/lib/config.ts` with its Zod schema, a nested `tuning` object, and hardcoded defaults. The existing `getConfig` resolver and import creation share `readConfig`. The frontend imports the shared contract directly. Mapping-only saves retain their previous behavior, and tuning persistence and UI controls remain deferred. The former environment-variable override was removed. All tuning defaults remain unchanged.

All 208 tests in 24 files passed. TypeScript checks, both builds, applicable Biome checks, readability checks, and `git diff --check` passed. Coverage verifies mapping-only configuration compatibility, independent settings copies, ignored legacy environment overrides, settings snapshots across new requests, and existing continuations retaining their captured settings. MCP Forge lint passed and development deployment `6.6.0` succeeded. No installation upgrade was required. A live smoke test was not rerun for this configuration refactor.

## Runtime worker budget cap (2026-10-29)

The worker budget now uses the smaller of the requested work budget and the actual remaining Forge invocation runtime minus a 60-second finalization reserve. It also subtracts time already spent loading the run from the requested budget. Both lifecycle processing and queued source cleanup use this helper. Configuration validation preserves the requested budget independently of the shorter configuration UI and request-entrypoint invocations. Comments beside the configuration field and manifest worker entries identify the relationship.

All 219 tests in 25 files passed. New fixtures cover shorter and longer runtime limits, startup elapsed time, immediate continuation when only finalization time remains, and checkpointed ingestion recovery when the provider deadline limits a larger configured budget. TypeScript checks, both builds, applicable Biome checks, readability checks, and `git diff --check` passed. MCP Forge lint passed and development deployment `6.7.0` succeeded. No installation upgrade was required. The runtime deadline cases use mocked Forge context, and a live smoke test was not rerun for this update.

## Configured finalization budget (2026-10-29)

`finalizationBudgetMs` replaces the separate work-budget setting and defaults to 60,000 milliseconds. Each worker calculates its processing budget directly from the remaining Forge invocation runtime minus this reserve. The former 110-second processing ceiling is removed. Item caps, concurrency, the 25-second request-start reserve, and the lifecycle deadline remain separate bounds.

Run manifests, summaries, and metric records use the current tuning shape. The settings snapshot is execution metadata used to keep continuations consistent and record the settings behind each result. It is separate from uploaded user records. No compatibility schema, migration, or fallback for the removed tuning field is included. Existing development KVS records were not purged, because the configured MCP service exposes no storage query or cleanup operation.

All 219 tests in 25 files passed, including configured finalization reserves, elapsed startup time, short remaining runtimes, checkpointed continuation, and settings snapshots. TypeScript checks, both builds, applicable Biome checks, readability checks, and `git diff --check` passed. MCP Forge lint passed and development deployment `6.8.0` succeeded. No installation upgrade was required. A live smoke test was not rerun.

## Current metrics and report format (2026-10-29)

The compatibility test for invocation logs without outcome counts was removed. Invocation outcome and reason maps are required and initialized when metrics collection begins. Invocations with no asset outcomes emit empty maps, including failed attempts whose results were not persisted. Report aggregation no longer substitutes missing maps. Client reports require input counts and the continuation-check flag that the current runner always writes. Run input counts are also required in the execution model. Tests reject missing required fields and verify empty maps for invocations without asset work.

The obsolete environment-override test and the inactive User mapping example were removed. Current documentation describes only the supported format. Local report-console output remains unchanged.

All 223 tests in 25 files passed. TypeScript checks, both builds, applicable Biome checks, readability checks, and `git diff --check` passed. MCP Forge lint passed and development deployment `6.9.0` succeeded. No installation upgrade was required. A live smoke test was not rerun.

## Development 6.9.0 smoke test (2026-10-29)

The fresh manual handoff completed successfully from `20:26:54Z` to `20:36:21Z`, with functional and metrics exit codes both zero. Captured Forge version metadata identified development `6.9.0`. Upload `smoke-import-1793305616949` contained 250 distinct users in six chunks. Rebuilding the performance report from the captured client data and logs passed and reproduced the handoff report. Coverage included both expected run summaries and 21 invocation observations, with zero malformed records.

| Check | Initial import | Identical repeat |
| --- | ---: | ---: |
| Selected assets | 499 | 249 |
| Updated references | 1 | 0 |
| Unmatched identities | 249 | 249 |
| Deleted retry assets | 249 | 0 |
| Reference attempts per processing invocation | 200, 200, 99 | 200, 49 |
| Lifecycle failures | 0 | 0 |
| Unfinished work | 0 | 0 |
| Largest serialized invocation metric | 2,032 bytes | 1,823 bytes |
| Total after admission | 264.066 s | 201.155 s |

The initial run included 249 pending retries for assets deleted by the preceding smoke cleanup. Confirmed absence removed those retries and accounted for all 249 observed HTTP 4xx responses. The repeat selected only the 249 unmatched assets. The associated asset remained outside that selection, and independent reference and timestamp assertions confirmed its unchanged association and `Updated` value. Both summaries reported `with_errors` solely because of the deliberately unmatched synthetic identities. Observed outcome and reason totals matched the persisted summaries. No HTTP 429, HTTP 5xx, or network-error counts were observed.

Both runs used the current configuration shape, with a 60-second finalization reserve, caps of 200 upload chunks and 200 reference assets, concurrency four, and a two-hour lifecycle limit. Each ingestion worker submitted all six chunks. Both reference runs crossed the item cap without exceeding 200 attempts or outcomes in any invocation. The longest observed invocation took 91.368 seconds. This run did not exercise a worker continuation caused by the runtime deadline.

| Observed phase | Initial import | Identical repeat |
| --- | ---: | ---: |
| Admission wait | 3.019 s | 0.748 s |
| Starting | 5.285 s | 5.923 s |
| Ingesting | 41.673 s | 40.338 s |
| Native completion polling | 28.105 s | 46.922 s |
| Discovery | 55.339 s | 46.764 s |
| Association processing | 112.926 s | 51.865 s |
| Aggregation | 20.511 s | 9.111 s |
| Finalizing | 0.158 s | 0.156 s |

The full client test took 561.823 seconds, including upload, both imports, assertion polling, 83.294 seconds of asset cleanup over 14 requests, and successful test-upload pruning. Cleanup confirmed that no generated assets remained. The additional deleted-asset retries and different native polling times make this a different workload from the earlier 250-user run. Only one real association write was exercised, so production throughput for 7,000 to 50,000 matched users remains unverified.
