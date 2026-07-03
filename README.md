# User Asset Synchronization

## Design

This seems silly because it still requires additional work unless we have direct access to the user data (would require edge proxy or some other access approach).
This approach does not change the need for something extra to associate asset to user (reference attribute).
So we would still need the controller queue to watch for completion of import then re-process every user asset looking for matching user to update reference with.
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

1. Webhook/scheduled task initiates import for workspaceId/importsourceId
   1. Lookup current execution, if in progress fail (not Done or Cancelled or undefined)
   1. Lookup latest import manifest
      1. If older than last execution, fail
         1. MAY just check for older than last _scheduled_ execution, or MAY look for last successfule execution if that information is stored somewhere
      1. If newer than last execution, submit request to worker queue
1. Worker queue recieves workspaceId/importsourceId/executionId/manifest/currentDataIndex
   1. Worker gets KV key from manifest at currentDataIndex
   1. If currentIndex is last index
      1. Worker submits value from key as data to import
         1. Worker sets `completed=true` on value, telling the Assets backend it has received the final chunk and may begin the (asynchronous) import work
      1. Worker does NOT submit a next index; the chain ends here
   1. If currentIndex is NOT last index
      1. Worker submits value from key as data to import
      1. Worker updates progress
      1. Worker submits next index to worker queue

There used to be a separate controller queue here, mirroring Atlassian's `assetsImportType` template: push to worker queue, then re-push to itself with a delay until worker items complete, then call the Assets API to signal completion.
That pattern exists to handle cases where the total item count isn't known up front (external pagination) and/or work is dispatched concurrently, so nothing can synchronously say "this was the last item".
Neither applies here.
The manifest's total count is known before the worker chain starts, and the chain is strictly serial, so the worker itself deterministically knows when it's on the last index and sets `completed=true` directly.
The controller queue added an extra hop with no value and was removed.

Note `completed=true` only tells the backend "you have every chunk, you may start importing" — it does not mean CMDB has finished ingesting.
If a future feature needs to react to the import actually finishing (e.g. the bolt-on reference-sync work below), it will need to poll `/importsource/{id}/executions/status` for a terminal state (Done/Failed/etc), most likely via a delayed self-requeuing queue kicked off by the worker's last batch.
That is a different responsibility than the old controller queue (watching Atlassian's execution state vs. watching our own worker items) and should be added if/when that feature is actually built.

1. Upon (actual, backend-confirmed) completion, something does the bolt-on work to update users reference

## See Also

* [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for local development and smoke test setup.
* [docs/NOTES.md](docs/NOTES.md) for design considerations, reference links, and future work.
