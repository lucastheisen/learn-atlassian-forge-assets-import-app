# Forge Hello World

This project contains a Forge app written in Javascript that displays "Hello, World!" and ImportId in the "Configure App" modal for 3rd Party Import Structures. 
It also outlines how to make use of Forge's Async Events API to import 3rd party data into Assets by setting up a controller and worker queue for data ingestion. 

See [developer.atlassian.com/platform/forge/assets-import-app/](https://developer.atlassian.com/platform/forge/assets-import-app) for documentation and tutorial of this Forge Template, including the [documentation of Asset APIs](https://developer.atlassian.com/cloud/assets/). 

Also see [Forge Async Events API Diagram](Https://dac-static.atlassian.com/platform/forge/images/assets-import-async-events-api-example.png?_v=1.5800.340) for a visual representation of the Async Events API.
With the Controller Queue a reference to `controller-resolver.js` and Worker Queue in `worker-resolver.js`

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start

- Modify your app frontend by editing the `src/frontend/index.jsx` file.

- Modify your app backend by editing the `src/resolvers/index.js` file to define resolver functions. See [Forge resolvers](https://developer.atlassian.com/platform/forge/runtime-reference/custom-ui-resolver/) for documentation on resolver functions.

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally:
```
forge tunnel
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Design

This seems silly because it still requires additional work unless we have direct access to the FAA data (edge proxy).
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
