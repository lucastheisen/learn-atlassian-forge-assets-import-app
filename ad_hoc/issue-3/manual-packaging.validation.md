# Manual packaging implementation validation

The application implementation is present locally on feat/issue-3-manual-packaging.
The deployment and live smoke results below describe the earlier development deployment and predate this cleanup.
Deployment and live verification of the cleanup remain pending.
Configuration UI verification remains pending.

## Passed locally

- TypeScript 6 checks for application source, build configuration, tests, and standalone scripts.
- Vite production builds for the Node 24 backend and UI Kit frontend.
- All 63 tests, including two packaging integration tests.
- All seven manifest handlers load as functions from a temporary backend package outside the repository, without access to its node_modules.
- Packaged JWT verification reaches request validation for a valid signature and rejects an invalid signature.
- Frontend entry scripts appear only in the HTML body and use relative paths.
- Frontend JavaScript passes Node's syntax check, uses classic JSX output, and contains no eager module-preload MutationObserver polyfill.
- Frontend output has no reserved file or directory names starting with double underscore.
- API declaration generation with TypeScript 6 produces no changes to tracked generated declarations.
- npm ci dependency-resolution dry runs for both packages.
- Biome lint exits successfully with the same 31 warnings and one informational diagnostic as the baseline.
- git diff --check.

The scripts package has a scoped override for openapi-typescript's TypeScript peer dependency.
Its published peer range currently permits only TypeScript 5.
The override keeps ordinary npm installs reproducible with TypeScript 6.
Generation succeeded against the project's existing patched schema.

The frontend bundle includes guarded browser helpers from Forge dependencies.
The Vite import helper checks for document before accessing it at initialization.
The iframe-resizer chunk is dynamically imported by the bridge's ADF renderer path, which this configuration UI does not call.
Actual UI Kit execution still requires verification in a browser.

## Forge lint

For the earlier deployment, authenticated `forge lint -e development` completed through the personal-tools MCP service with exit code 0 and `No issues found`.
Forge lint for the current cleanup passed on October 22 with exit code 0 and `No issues found` after refreshing the MCP token and unlocking the credential vault.
The user-side CLI was version 14.0.0 and reported that an update was available.

The initial MCP invocation tried to parse generated backend JavaScript with the source-only TypeScript configuration.
An explicit generated JavaScript ignore glob prevents that scan.
Explicit TypeScript include globs ensure Forge lint selects the source files.
Local file-selection verification confirmed that the UI source remains included and generated JavaScript is excluded.
Both package type checks pass after these configuration changes.

## Development deployment

Forge accepted the final packages and reported a successful development deployment, version `5.19.0`.
Verification remained enabled, including Forge lint during deployment.
That deployment predates the current cleanup.
For the next deployment, record its Forge version and correlate a fresh test invocation with the platform log metadata, following `docs/DEVELOPMENT.md`.
The UI has not yet been verified in a browser.

## Live smoke verification

The operator ran the smoke-test handoff against the development webtrigger.
The saved result and both logs were read back and confirmed successful.

- Upload run `smoke-1792605366873` completed five chunks containing 15 synthetic records.
- Upload manifest assertions passed and test-manifest pruning returned 200.
- Import run `smoke-import-1792605373525` completed five chunks containing 15 synthetic records.
- The deployed assertion confirmed execution status `DONE`.
- The Assets query found exactly 15 `Smoke User` objects tagged with that run ID in `Title`.
- Imported-object cleanup and test-manifest pruning both returned 200.

These checks verify the live upload and import pipeline.
They assert object counts and the run tag, rather than every imported attribute value.
Their saved results were not correlated with Forge invocation version metadata and do not verify the configuration UI.

## Pending

- Deployment and live verification of the current cleanup.
- Correlation of a fresh smoke invocation with the expected Forge deployment version.
- Configuration UI rendering and save verification.
