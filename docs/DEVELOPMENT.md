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
   - `Atlassian User` (User)
     - Not resolvable via this import source yet — see [issue #2](https://github.com/lucastheisen/learn-atlassian-forge-assets-import-app/issues/2).
       Kept here anyway since we intend to populate it, either once that's fixed upstream or via the bolt-on process in `docs/NOTES.md`.
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
         "Active": ["active"],
         "Atlassian User": ["email"]
       },
       "objectTypeName": "Smoke User",
       "selector": "users"
     }
   ]
   ```

   The right-hand side of each `attributeMap` entry is the field name from `scripts/lib/smoke-users.ts`'s `buildUsersChunk`; `selector: "users"` picks out the `users` array that function nests its records under.
   `Atlassian User` is included for forward-compatibility but currently has no effect — the schema-and-mapping endpoint doesn't expose User-type attributes, so this app's own mapping logic silently drops it (see `issue #2`, linked above).
   The import still succeeds with it left unresolved/empty.
   `scripts/smoke-import.ts` overrides `title` per run to a unique run id, since that's how its `import-smoke-assert`/`import-smoke-cleanup` calls scope themselves to only the objects a given run created.
6. The same app screen displays `ImportId` and `WorkspaceId` at the top — export them as environment variables:
   - `FORGE_SMOKE_WORKSPACE_ID`: the displayed `WorkspaceId`
   - `FORGE_SMOKE_IMPORT_SOURCE_ID`: the displayed `ImportId`
