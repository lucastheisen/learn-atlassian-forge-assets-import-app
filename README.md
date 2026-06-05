# User Asset Synchronization

## Design

This seems silly because it still requires additional work unless we have direct access to the user data (would require edge proxy or some other access approach).
This approach does not change the need for something extra to associate asset to user (reference attribute).
So we would still need the controller queue to watch for completion of import then re-process every user asset looking for matching user to update reference with.
This bolt on extra work could be performed via webhook -> queue directly without the import stuff.
So the _only_ value of this import process would be that _IF_ we can get the edge proxy installed allowing direct access to FAA data, then we do not need any external resources (AWS lambda/vm) to perform the user assets upload/import.

1. Webhook uploads data to K/V store
   1. One file per 100 records, json format
      1. Key is: `import:data:<yyyyMMDDhhmmss>:<index>`
      1. Format:

         ```json
         [
           {...},
           {...}
         ]
         ```

   1. Last file uploaded is manifest
      1. Key is: `import:manifest:<yyyyMMDDhhmmss>`
      1. Format:

         ```json
         {
           "data": [
             {
               "key": "import:20260526100000:1"
             },
             {
               "key": "import:20260526100000:2"
             },
             {
               "key": "import:20260526100000:3"
             }
           ],
           "timestamp": "2026-05-26T10:00:00-04:00",
           "totals": {
             "keys": 3,
             "records": 336
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
