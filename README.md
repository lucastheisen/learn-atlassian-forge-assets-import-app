# User Asset Synchronization

## Design

This seems silly because it still requires additional work unless we have direct access to the user data (would require edge proxy or some other access approach).
This approach does not change the need for something extra to associate asset to user (reference attribute).
The controller queue watches native import completion, then associates changed or unassociated user assets and retries earlier failures.
This bolt on extra work could be performed via webhook -> queue directly without the import stuff.
So the _only_ value of this import process would be that _IF_ we can get the edge proxy installed allowing direct access to FAA data, then we do not need any external resources (AWS lambda/vm) to perform the user assets upload/import.

1. Webhook (implemented as a Forge webtrigger, see `src/resolvers/webtrigger/`) uploads data to K/V store via a multi-step lifecycle: `upload-new` creates a staging manifest, one or more `upload-data` calls persist chunks of records, then `upload-complete` assembles the final import manifest and cleans up staging keys. `upload-abort` cancels an in-progress upload; `prune` removes old completed manifests.
   1. Each `upload-data` call persists one chunk (caller-determined size, not fixed at 100), json format
      1. Key is: `import:data:<ISO-8601 timestamp>:<index, zero-padded to 6 digits>`
      1. Format:

         ```json
         {
           "<topLevelKey>": [
             {...},
             {...}
           ]
         }
         ```

   1. `upload-complete` writes the final manifest (not implicitly inferred from upload order)
      1. Key is: `import:manifest:<ISO-8601 timestamp>:manifest` — or `import:test-manifest:<ISO-8601 timestamp>:manifest` for uploads marked `testing: true`. Test uploads are segregated into this separate keyspace so the real import flow below can never pick them up; see `src/lib/kv-data.ts` and `AGENTS.md > Project > CI`.
      1. Format:

         ```json
         {
           "uploadId": "some-upload-id",
           "testing": false,
           "data": [
             {
               "index": 1,
               "key": "import:data:2026-05-26T10:00:00.000Z:000001",
               "count": 100
             }
           ],
           "timestamp": "2026-05-26T10:00:00.000Z",
           "totals": {
             "keys": 1,
             "records": 100
           }
         }
         ```

1. The native Assets module hook or authenticated `import-start` command persists a request using the latest completed upload (test imports use their separate manifest namespace).
2. The shared lifecycle consumer atomically admits one installation-wide import. Later requests wait durably.
3. The native worker submits chunks with deterministic IDs and marks the final chunk `completed=true`.
4. The reference consumer polls that execution until the native result is successful, seals a durable workset of changed/empty-reference user assets plus pending retries, and associates each eligible asset with one Jira account.
5. Processing checkpoints, durable retries, and a five-minute recovery trigger handle interruptions. A compact terminal summary is persisted before admission is released. The latest three runs are retained independently of pending retries.

See [User references after import](docs/USER_REFERENCE_SYNC.md) for the code-defined schema conventions, replaceable lookup contract, timing limits, status storage, recovery, and development verification. Native import completion can precede reference completion. This feature adds no report UI or notification channel.

## See Also

* [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for local development and smoke test setup.
* [docs/NOTES.md](docs/NOTES.md) for design considerations, reference links, and future work.
