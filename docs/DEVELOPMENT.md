# Development

## Prerequisites

Follow [these instructions](https://developer.atlassian.com/platform/forge/getting-started/) to set up `node` and the `forge` CLI, then `forge login`.

Use Node 24, matching the Forge runtime.
Install both npm packages from the repository root:

```sh
npm ci
npm --prefix scripts ci
```

The standalone scripts under `scripts/` have their own package and lockfile.
Both packages use TypeScript 6 for type checking.
The scripts package overrides `openapi-typescript`'s TypeScript 5 peer range to use the same compiler.
API generation has been checked with TypeScript 6 and produces unchanged declarations.
Recheck `npm run generate:assets-api` when updating either dependency.

## Build and Deploy

Run these commands from the repository root before a development deployment:

```sh
npm run build
npm test
forge deploy --non-interactive --e development
```

[`forge deploy`](https://developer.atlassian.com/platform/forge/cli-reference/deploy/) runs Forge lint as part of its pre-deployment checks.
Run `forge lint -e development` separately when you want those checks without deploying.
Forge does not run this project's build or Vitest suite, so `npm run build` and `npm test` remain explicit steps.

`npm run build` type-checks the app and standalone scripts before building both application packages with Vite.
`npm run typecheck` runs those checks without building.
The backend build targets Node 24 and writes CommonJS handlers and bundled dependencies to `dist/backend`.
The frontend build writes the UI Kit resource to `dist/frontend`, using classic JSX transformation and relative asset paths.
Its entrypoint is `src/frontend/index.tsx`, compiled to `dist/frontend/index.js`.
Vite copies `src/frontend/public/index.html` unchanged into the output directory.
That HTML already references `./index.js` from its body, as required by Forge UI Kit.
Both builds include source maps and replace their own output directories.

Keep the explicit TypeScript source globs in `tsconfig.json` so Forge lint selects the source files.
The generated JavaScript file glob in `.gitignore` keeps Forge lint from parsing the Vite bundles when it scans the UI resource's parent directory.

The manifest uses Forge's [manual packaging preview](https://developer.atlassian.com/platform/forge/manifest-reference/packaging/).
Forge uploads these outputs without compiling the source files.
Always rebuild after editing app source or build configuration before running `forge deploy`.
The packaging tests build in a temporary directory and do not refresh the deployment outputs in `dist`.
They check handler exports and JWT verification without installed backend dependencies, along with the frontend HTML and JavaScript contract.

After deploying, verify the configuration UI and run the upload smoke test below.
Run the import smoke test only after configuring its dedicated import source.

### Major Version Upgrades

Permission changes can require a new Forge major version and an upgrade of the existing installation.
The current MCP deployment tool cannot acknowledge `MAJOR_VERSION_RULE` or upgrade installations, so ask the operator to run this command after the build and tests pass:

```sh
(
  cd /workspace/github.com/lucastheisen/learn-atlassian-forge-assets-import-app || exit
  forge deploy --non-interactive --environment development \
    --approve MAJOR_VERSION_RULE &&
  forge install --non-interactive --upgrade --confirm-scopes \
    --environment development --product jira \
    --site lucastheisen.atlassian.net
)
```

The subshell preserves the operator's current directory. Confirm both deployment and installation upgrade succeeded before running live checks that require the new permissions.
Subsequent minor deployments apply automatically to installations on that major version and continue through MCP.
See [Forge app versions](https://developer.atlassian.com/platform/forge/versions/) and the [installation command](https://developer.atlassian.com/platform/forge/cli-reference/install/).

### Verify the Deployment

Record the target environment, deployment time, and Forge version reported by `forge deploy`.
The [Deployments page](https://developer.atlassian.com/platform/forge/versions/) in the developer console provides the deployment history.
Build immediately before deploying so the uploaded packages contain the current changes.

After deployment, run a fresh smoke test against that environment.
In the developer console, use the test execution time, site, and relevant import or worker log messages to find its invocations.
Check their Version and Environment attributes against the deployment record.
Forge supplies this metadata, as described in [View app logs](https://developer.atlassian.com/platform/forge/view-app-logs/).
An earlier successful test or a successful deployment alone does not establish which version handled a new test.

Logs are also available from the repository root:

```sh
forge logs -e development --since 15m --verbose
```

These checks identify the backend version that handled the test.
Refresh the Assets import configuration screen after deployment and verify that the form loads and saves correctly as a separate frontend check.

### Package Versioning

The maintainer updates the root `package.json` version manually when preparing a release.
Routine development deployments do not require a package version bump.
Choose a patch increment for compatible bug fixes, a minor increment for compatible features, and a major increment for breaking changes.
For example, run this from the repository root for a patch release:

```sh
npm version patch --no-git-tag-version
```

Use `minor` or `major` instead of `patch` for those release types.
[`npm version`](https://docs.npmjs.com/cli/v11/commands/npm-version/) updates `package.json` and `package-lock.json` together.
The flag prevents npm from creating a Git commit or tag.
Review and commit both files through the normal release review process.
Create a Git tag matching the package version with a `v` prefix, such as `v1.1.38`.
From that committed release, run the local build and tests, then upload a Forge build using the same tag:

```sh
npm run build
npm test
forge build --tag v1.1.38
forge deploy --tag v1.1.38 --non-interactive --e development
```

Replace `v1.1.38` with the actual release tag and choose the intended deployment environment.
For this prototype, tagged Forge builds are a manual release step.
Normal development deployments use `forge deploy` without a tag, as shown above.
The standalone scripts package has no version field and does not need a matching bump.

The npm package version is separate from [Forge app versions](https://developer.atlassian.com/platform/forge/versions/), which Forge manages during deployment.
Use Forge deployment and invocation records to identify deployed versions.

## Running Scripts

The root `package.json` proxies each script via `npm --prefix scripts run <name>`, so `npm run smoke:upload` from the repo root works the same as `npm run smoke:upload` from inside `scripts/`.
See `scripts/package.json` for the full list, and add a matching proxy entry in the root `package.json` for any new script.

Most scripts talk to the deployed app through its webtrigger, so they need `FORGE_WEBTRIGGER_URL` and `FORGE_WEBTRIGGER_SECRET` set in the environment first.
Local code edits have no effect until you build and deploy them, as described above.

## Smoke Tests

Smoke tests exercise the deployed app end-to-end through its webtrigger, the same way `scripts/lib/webtrigger-client.ts` drives requests for any other script.

### Upload Smoke Test (`scripts/smoke-upload.ts`)

Builds a small multi-chunk upload (`upload-new` / `upload-data` / `upload-complete`), then asserts the resulting manifest via the `upload-smoke-assert-latest` webtrigger command.
Uploads are marked `testing: true`, which routes them into a separate KV keyspace (see `src/lib/kv-data.ts`) so this can never touch real import manifests.
Run with `npm run smoke:upload`.

### Import Smoke Test (`scripts/smoke-import.ts`)

Drives a real import execution end-to-end: uploads a test manifest, starts an import against it via the `import-start` webtrigger command, polls `import-smoke-assert` until the execution reaches `DONE`, then confirms the objects and reference-processing summary. With `FORGE_SMOKE_USER_EMAIL` set, it verifies a real account association, repeats the identical import, and checks that the associated asset’s `Updated` timestamp is unchanged.
After reference processing finishes, `import-smoke-cleanup` deletes the objects it created and `prune` deletes the test manifest. Cleanup waits for the active lifecycle; a lifecycle that cannot finish leaves its test input intact for recovery.
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
   - `Atlassian User` (User)
     - Set maximum cardinality to **1**. The app populates it after native import completion; native mapping still excludes User attributes (see [issue #2](https://github.com/lucastheisen/learn-atlassian-forge-assets-import-app/issues/2)).
4. In the schema's settings, open the **Import** tab and add an import configuration, picking this Forge app.
   This is the step that mints a new `importSourceId` isolated from the real one — there is no API to create an import source, only this UI wizard.
5. Open that import configuration's app screen (it loads this app's own `getConfig`/`setConfig` UI) and paste this into the mapping editor for `Smoke User`:

   ```json
   [
     {
       "attributeMap": {
         "Active": ["active"],
         "Email": ["email"],
         "First Name": ["first_name"],
         "Key": [],
         "Last Name": ["last_name"],
         "Name": ["name"],
         "Phone": ["phone"],
         "Title": ["title"]
       },
       "objectTypeName": "Smoke User",
       "selector": "users"
     }
   ]
   ```

   Each `attributeMap` value names fields generated by `buildUsersChunk` in `scripts/lib/smoke-users.ts`. The `users` selector selects the array containing those records.
   Native mapping excludes `Atlassian User`. Post-import reference processing populates that attribute through the fixed `Email` lookup. Unmatched synthetic smoke users remain empty and appear as unresolved associations in the retained summary.
   `scripts/smoke-import.ts` overrides `title` per run to a unique run id, since that's how its `import-smoke-assert`/`import-smoke-cleanup` calls scope themselves to only the objects a given run created.
6. The same app screen displays `ImportId` and `WorkspaceId` at the top — export them as environment variables:
   - `FORGE_SMOKE_WORKSPACE_ID`: the displayed `WorkspaceId`
   - `FORGE_SMOKE_IMPORT_SOURCE_ID`: the displayed `ImportId`


### Reference-processing verification

The new `read:email-address:jira` and `read:jira-user` scopes require a development installation upgrade after deploying this change. Grant the app identity permission to browse Jira users and update the dedicated Assets type. The app discovers the type through its native `users` selector. Do not add a second mapping with that same selector.

Set `FORGE_SMOKE_USER_EMAIL` to an existing Jira user's email before `npm run smoke:import`. The first synthetic record will use that email. The test checks the persisted User reference's account email through Jira, then runs an identical full import and verifies that this record's `Updated` timestamp did not change. The other 14 synthetic addresses must produce the specific `unmatched` reason. Lookup errors, unexpected reasons, incomplete selection, and unfinished work fail the test. The initial run must perform one association write, and the identical repeat must perform zero. The expected summary status is `with_errors` because of those deliberate negative cases. With no real email supplied, the test validates only the unmatched path.

Every poll correlates to the newest lifecycle request for that upload, including requests still queued without a native execution. A preceding execution's `DONE` cannot satisfy it. Fixed HTTP 202 responses identify the current phase. HTTP 409 indicates a failed assertion or lifecycle. Other HTTP errors fail immediately. The script prints elapsed time, request counts, phase changes, and a heartbeat at least every 15 seconds between requests. Requests time out after 30 seconds. Only read-only checks retry transport failures, within a five-minute deadline per check.

Set `FORGE_SMOKE_REPORT_FILE` to write a client timing JSON file, including failed checks and cleanup results. The script does not print success until cleanup and test-upload pruning both succeed.

For a run that crosses the default 200-asset reference batch limit, set `FORGE_SMOKE_USER_COUNT=250`, `FORGE_SMOKE_REQUIRE_CONTINUATION=true`, and optionally `FORGE_SMOKE_POLL_TIMEOUT_MS=900000`. The default remains 15 users and a five-minute deadline per polling step. The larger fixture uses six chunks, with one record in the first chunk for the real email and at most 50 records in each subsequent chunk. Generated names and synthetic addresses remain distinct across chunks. With a real email, the expected unmatched count is 249 in each import.

Object assertions query the total count rather than counting one page. Cleanup repeatedly queries its first remaining page of at most 20 objects, deletes at most four concurrently within a request budget, and reports completion only after a query confirms no matching objects remain. A partial cleanup retains the baseline and completed upload for recovery.

### Collect lifecycle performance evidence

Workers emit one metadata-only `IMPORT_METRICS` JSON log per finished invocation and one `IMPORT_SUMMARY` JSON log per completed run, correlated by upload, run, execution, and invocation IDs. These logs contain the following measurements.

- AQL candidate/page counts, retry pages/entries, empty retry pages, association attempts, continuations, scheduled backoff, HTTP 429/4xx/5xx responses, and network failures.
- Effective tuning settings and upload chunks submitted per invocation.
- Input records/chunks, checkpointed chunks, selected assets, outcome/reason counts, unfinished work, and lifecycle failures.
- Invocation duration, requested queue delay, and excess delivery lag.
- Newly finalized outcome/reason counts per invocation and a separate reused-result count. Detailed asset diagnostics remain in KVS.
- Product API and KVS operation counts, cumulative/mean/maximum latency, and rejected-operation counts, grouped by phase.
- Wall duration for each lifecycle phase, admission wait, and retention time.

The manual smoke handoff also retrieves development Forge logs after the test and builds a combined JSON report. Run the following command with absolute paths to build it from already collected files. The npm command runs the report entrypoint from the scripts directory.

```sh
npm run smoke:import:report -- /path/to/client.json /path/to/forge-logs.txt /path/to/performance.json
```

The report reads standalone application messages and the formatted `INFO` lines emitted by Forge CLI. Verbose CLI diagnostics can include escaped copies of those messages in JSON metadata. Those copies are ignored. The report deduplicates invocation IDs and filters logs to that smoke upload. It requires summaries and invocation observations for both imports and reports malformed or missing log coverage. A malformed application message still fails validation. Log ingestion can lag completion. Collect again after a short delay if necessary. A partial report remains useful for diagnosis but does not count as successful metrics collection.

Client reports require input chunk and record counts and an explicit continuation-check flag. Invocation records require outcome and reason maps, including empty maps when no assets produced outcomes. Missing fields fail validation. Only the current report format is supported.

The scripts package declares its own Zod dependency. Shared schemas in `src/lib/reference-schemas.ts` and `src/lib/reference-metric-schemas.ts` define reference outcomes, lifecycle phases, metric counters and operations, and summary records. Both the app and scripts infer their types from these schemas. The shared modules have no Forge or Node service dependencies. Completed-log schemas extend the base processing contracts with the fields required for smoke reports. Client report and HTTP metadata schemas remain in `scripts/lib/import-smoke-schemas.ts`. Object schemas strip unknown fields. Enum keys, integer counts, timestamps, and outcome totals are validated. Validation failures use metadata-only error messages so rejected response values are not printed.

Phase duration includes queue waits and retries. The report preserves persisted summary timings and separately records observed completion timings after summary persistence and admission release. The latter also capture delays while finalization recovers from an error. Native polling time does not isolate Atlassian's server compute time. Concurrent operation totals overlap. `retry.query` includes `kvs.query`, and retention time is included in starting/finalizing. Do not add these together as disjoint wall times. Operation errors count rejected calls. HTTP error responses are counted separately. Invocation logs are best effort, especially around platform timeouts, so these are diagnostic observations rather than exact billing counters.

The report derives observed association throughput and time per selected asset. Forecasting 7,000 to 50,000 users additionally requires representative candidate counts, match/write rates, retry backlogs, pagination, and throttling. The 15-record fixture alone cannot establish that completion time.

Each invocation emits one metrics summary, including any completed work before a budget exit or failure. Outcome counts are recorded after terminal work and retry-cleanup state have been persisted. Replaying an already completed item increments the reused-result counter. The report aggregates these observations as `outcomesObserved` and `reasonsObserved`, deduplicating invocation IDs. These diagnostic counts remain separate from the authoritative completed-run counts. Detailed records remain in KVS, and unresolved assets do not produce individual warning messages.

When continuation is required, report validation checks that the recorded input exceeds the stored reference item cap and matches the client upload counts. Both imports must show at least two invocations attempting assets. Each invocation must stay within the cap, and observed outcomes and reasons must account for the persisted totals. The report records the maximum serialized invocation metric size as diagnostic metadata. Missing observations fail evidence collection and can be collected again after log ingestion catches up. This fixture verifies continuation and the unmatched path, with one successful association. It does not establish throughput for hundreds of successful account matches and writes. Its six upload chunks also do not cross the ingestion chunk cap.

The script entrypoint reads environment settings. Reusable import-smoke logic lives in `scripts/lib/import-smoke.ts`. Source data and identity values are not printed. Cleanup also removes the small test timestamp baseline. There is no new reporting endpoint. These checks extend the existing authenticated smoke-test commands.

See [User references after import](USER_REFERENCE_SYNC.md) for KVS access paths, timing limits, retention, and recovery. Mocked scale tests do not establish real cloud completion times.

### Tune import processing

Tuning belongs to the shared `Config` model in `src/lib/config.ts`. It currently uses hardcoded defaults from `ImportTuningSchema`. Both default caps are 200, with ingestion counting upload chunks and reference processing counting individual assets. To compare a different setting, change its schema default, run the tests and build, and deploy to development through the normal deployment process. No installation upgrade is needed for tuning changes. Existing requests retain their captured settings, and new imports use the updated defaults.

The configuration screen continues to load and save the native mapping. Tuning controls and persistence will use the same configuration model when added. There is no environment-variable override for import tuning.

The worker calculates its work budget from the remaining invocation runtime reported by Forge minus `finalizationBudgetMs`, which defaults to 60,000 milliseconds. Changing either worker timeout in `manifest.yml` therefore changes the available processing time automatically. There is no separate work-budget setting. Run manifests and summaries retain these settings as execution metadata, independently of uploaded user records. Stale development records can be discarded, and no migration between unreleased formats is provided.

See the [tuning settings and ranges](USER_REFERENCE_SYNC.md#performance-tuning). Capture reports before and after changing one setting. Compare identical workloads and distinguish queue overhead, request latency, and throttling. The former one-chunk-per-invocation behavior can be reproduced by setting the `ingestionChunks` default to 1. The small smoke fixture validates bounded processing and recovery but cannot determine the best settings for 7,000 or 50,000 users.
