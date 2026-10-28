# User reference synchronization validation

## Development smoke test — 2026-10-28

The operator deployed Forge version `6.0.0` to development and upgraded its existing Jira installation on `lucastheisen.atlassian.net`, granting `read:jira-user` and `read:email-address:jira`.

The manual handoff completed with `status=success`, `step=complete`, and `exit_code=0` against the dedicated Smoke Test source:

- Workspace: `3380a6d2-092b-493a-a9dc-cf0c5197e23b`
- Import source: `cec77afc-b27b-4556-bc6e-994816a6e98b`
- Upload/run marker: `smoke-import-1793200012873`

The test uploaded 15 records in five chunks. It verified that one asset had exactly one User reference, independently confirmed that account's email through Jira, and checked that the other 14 records produced unresolved outcomes in the completed summary. An identical full re-import passed the same checks and left the associated asset's `Updated` timestamp unchanged. Asset cleanup and test-upload pruning both succeeded.

The handoff started at `15:05:59Z` and finished at `15:11:54Z`: 5 minutes 55 seconds including interactive ID entry, both imports, assertion polling, and cleanup. This does not establish the duration of one import or throughput at 7,000–50,000 users. Per-phase durations are persisted in run summaries and completion logs; they were not retrieved during this manual test.

The initial native-status check can observe a preceding execution's `DONE`; the object checks are scoped to the unique run marker, and the reference checks require the newest app run for that upload to be complete and match the latest native execution. Future script runs print polling progress every 15 seconds. That local script-only diagnostic change followed this successful live test; no deployed application code changed after version `6.0.0`.

## Local validation

The final `npm run build` and `npm test` checks passed on 2026-10-28; all 129 tests in 16 files passed. Applicable Biome checks passed with ten existing `noExplicitAny` warnings in the shared KVS tests and one informational template-literal suggestion in the scale fixture. `git diff --check` passed. Forge lint reported no issues during the successful development deployment.

The implementation includes unit and scale fixtures covering recovery, admission, partial storage failures, bounded execution, lookup ambiguity, retained results, and privacy. The 7,000- and 50,000-record scale fixtures use mocked APIs and do not establish cloud performance. See [implementation behavior and storage measurements](../../docs/USER_REFERENCE_SYNC.md).
