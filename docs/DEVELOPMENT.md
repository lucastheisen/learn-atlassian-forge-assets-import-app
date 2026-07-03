# Development

## Prerequisites

Follow [these instructions](https://developer.atlassian.com/platform/forge/getting-started/) to set up `node` and the `forge` CLI, then `forge login`.

The standalone scripts under `scripts/` are a separate npm workspace.
Run `npm install` inside `scripts/` before invoking any of them.

## Running Scripts

The root `package.json` proxies each script via `npm --prefix scripts run <name>`, so `npm run smoke:upload` from the repo root works the same as `npm run smoke:upload` from inside `scripts/`.
See `scripts/package.json` for the full list, and add a matching proxy entry in the root `package.json` for any new script.

Most scripts talk to the deployed app through its webtrigger, so they need `FORGE_WEBTRIGGER_URL` and `FORGE_WEBTRIGGER_SECRET` set in the environment first.
Local code edits have no effect until you `forge deploy` — see `AGENTS.md > Project > Deployments`.

## Smoke Tests

Smoke tests exercise the deployed app end-to-end through its webtrigger, the same way `scripts/lib/webtrigger-client.ts` drives requests for any other script.

### Upload Smoke Test (`scripts/smoke-upload.ts`)

Builds a small multi-chunk upload (`upload-new` / `upload-data` / `upload-complete`), then asserts the resulting manifest via the `upload-smoke-assert-latest` webtrigger command.
Uploads are marked `testing: true`, which routes them into a separate KV keyspace (see `src/lib/kv-data.ts`) so this can never touch real import manifests.
Run with `npm run smoke:upload`.

### Import Smoke Test (`scripts/smoke-import.ts`)

Drives a real import execution end-to-end: uploads a test manifest, starts an import against it via the `import-start` webtrigger command, polls `import-smoke-assert` until the execution reaches `DONE`, then polls it again to confirm the expected objects landed in CMDB.
Cleans up afterward via `import-smoke-cleanup` (deletes the objects it created) and `prune` (deletes the test manifest), regardless of pass/fail.
Unlike uploads, there is no `testing: true` flag for import executions — every run really creates objects in CMDB via the Assets API.
So this smoke test targets a dedicated test import source, isolated from any import source that touches real data, set up once per environment as described below.
Run with `npm run smoke:import`.

The script checks for the environment variables below before doing anything, and fails fast with a pointer back to this doc if they're missing, rather than silently running against the wrong import source (or none at all).

#### One-time Environment Setup

This only needs to be done once per Jira site/environment, not per smoke test run.
The smoke test code expects the exact names below.

1. In Jira Service Management, open **Assets** and create a new object schema, using the empty/blank template:
   - Name: `Smoke Test`
   - Key: `SMOKE`
2. In that schema, create an object type:
   - Name: `Smoke User`
3. On `Smoke User`, add these attributes:
   - `First Name` (Text)
   - `Last Name` (Text)
   - `Email` (Text)
   - `Phone` (Text)
   - `Title` (Text)
   - `Active` (Boolean)
4. In the schema's settings, open the **Import** tab and add an import configuration, picking this Forge app.
   This is the step that mints a new `importSourceId` isolated from the real one — there is no API to create an import source, only this UI wizard.
5. Open that import configuration's app screen (it loads this app's own `getConfig`/`setConfig` UI) and paste this into the mapping editor for `Smoke User`:

   ```json
   [
     {
       "attributeMap": {
         "Key": [],
         "Name": ["name"],
         "First Name": ["first_name"],
         "Last Name": ["last_name"],
         "Email": ["email"],
         "Phone": ["phone"],
         "Title": ["title"],
         "Active": ["active"]
       },
       "objectTypeName": "Smoke User",
       "selector": "users"
     }
   ]
   ```

   The right-hand side of each `attributeMap` entry is the field name from `scripts/lib/smoke-users.ts`'s `buildUsersChunk`; `selector: "users"` picks out the `users` array that function nests its records under.
   `scripts/smoke-import.ts` overrides `title` per run to a unique run id, since that's how its `import-smoke-assert`/`import-smoke-cleanup` calls scope themselves to only the objects a given run created.
6. The same app screen displays `ImportId` and `WorkspaceId` at the top — export them as environment variables:
   - `FORGE_SMOKE_WORKSPACE_ID`: the displayed `WorkspaceId`
   - `FORGE_SMOKE_IMPORT_SOURCE_ID`: the displayed `ImportId`
