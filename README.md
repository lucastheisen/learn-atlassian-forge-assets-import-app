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
      1. If newer than last execution, submit request to controller queue
1. Controller queue receives workspaceId/importsourceId/executionId/manifest
   1. Submits data load to worker queue
   1. Submits monitor task to controller queue watching for completion
1. Worker queue recieves workspaceId/importsourceId/executionId/manifest/currentDataIndex
   1. Worker gets KV key from manifest at currentDataIndex
   1. If currentIndex is last index
      1. Worker submits value from key as data to import
         1. Worker sets `completed=true` on value
      1. Worker submits next index to worker queue
   1. If currentIndex is NOT last index
      1. Worker submits value from key as data to import
      1. Worker updates progress
      1. Worker submits next index to worker queue
1. Controller queue monitor task waits until import is complete
1. Upon completion controller queue does something to update users reference
