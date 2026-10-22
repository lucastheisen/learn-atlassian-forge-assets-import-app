# TypeScript 6 with Vite and Forge manual packaging

## Context

The root project already depends on TypeScript 6.0.3.
The standalone tooling under `scripts/` still depends on TypeScript 5.
The app currently relies on Forge to compile and bundle backend functions and the UI Kit resource.
Manual packaging lets the project control that build independently of Forge's bundled compiler.

The chosen approach is Vite for both application builds and TypeScript 6 for type checking.
Tracked in [issue #3](https://github.com/lucastheisen/learn-atlassian-forge-assets-import-app/issues/3).
Implementation starts after the plan is reviewed.

## Alternatives considered

### Vite for both builds

Vite is already installed through Vitest, but application builds need a direct dependency and their own configuration.
A local probe built the UI Kit frontend and a Node 24 CommonJS backend with dependencies bundled.
The backend needed one existing type re-export changed to `export type`.
The probe applied that change in memory and left project source unchanged.
All seven backend handlers loaded as functions.
Local JWT checks reached validation for a valid signature and rejected an invalid signature.

Vite's server build needs explicit CommonJS output and dependency bundling.
This configuration avoids a separate backend bundler or a production dependency staging step.

### esbuild for both builds

A local probe bundled both application entrypoints successfully.
The backend required fewer options.
Frontend HTML would need separate handling.
This adds another directly configured build tool without a demonstrated need in this app.

### Vite frontend and TypeScript backend

This follows the tools in Atlassian's examples closely.
A local TypeScript 6 probe compiled the backend and loaded its handlers with access to installed dependencies.
A deployable output would also need its production dependencies staged under the backend output directory.
The extra dependency staging is the main reason to prefer a bundled backend.

## Approach

1. Add Vite as a direct development dependency using npm.
   Keep Vitest as the test runner.
2. Add separate frontend and backend build configurations.
   Output the backend under `dist/backend` and UI Kit assets under `dist/frontend`.
3. Build the backend for the existing Node 24 runtime.
   Produce a CommonJS `index.js` with every manifest handler and all required runtime dependencies.
   Keep Node built-ins external.
   Preserve source maps for debugging.
4. Build the frontend as one UI Kit resource with relative asset paths and classic `React.createElement` JSX transformation.
   Build directly from `index.tsx` and copy the static `public/index.html` unchanged, with its script reference already in the body.
   Check the generated bundle for browser assumptions that conflict with UI Kit execution.
5. Rename the JavaScript backend entrypoint to TypeScript so it participates in type checking.
   Correct the existing type re-export and enable checks appropriate to isolated transpilation.
6. Configure `manual@2026` packaging for the backend and UI Kit resource in `manifest.yml`.
   Keep the existing function names, runtime, scopes, and permissions.
7. Align the standalone scripts with TypeScript 6 using their separate npm package.
8. Provide a build command that runs type checking before producing deployment artifacts.
   Document build, validation, and development deployment commands in `docs/DEVELOPMENT.md`.
9. Verify a fresh live test against the Forge deployment version using platform invocation metadata.
   Use the version and environment attributes supplied by Forge.
10. Document manual npm package version bumps separately from Forge app versioning.

## Out of scope

- Adding CI workflows.
- Changing import behavior or the configuration mapping workflow.
- Migrating to TypeScript 7 or changing package managers.
- Refactoring JWT authentication or unrelated application code.
- Changing scopes or production installations.

## Verification

- Run root and standalone-script type checks.
- Run the existing unit tests.
- Build frontend and backend outputs from a clean output directory.
- Confirm every manifest handler is exported as a function from the packaged backend.
- Check that external backend imports resolve without the repository's `node_modules`.
- Exercise valid and invalid JWT paths in the packaged backend without calling product APIs.
- Check the frontend HTML structure, relative paths, JSX output, and reserved file names against Forge's packaging standard.
- Run the applicable lint checks and `forge lint` without bypassing verification.
- Deploy to development before treating any live result as evidence about the change.
- Verify the configuration UI and upload smoke path on the development deployment.
- Run the import smoke path only with the documented dedicated smoke import source configured.

Local build probes establish feasibility.
They do not establish that Forge accepts the final package or that the deployed app behaves correctly.
Those checks remain required before the feature is complete.

## References

- [FRGE-887](https://ecosystem.atlassian.net/browse/FRGE-887)
- [Forge manual packaging](https://developer.atlassian.com/platform/forge/manifest-reference/packaging/)
- [Forge packaging standard](https://developer.atlassian.com/platform/forge/manifest-reference/packaging/standard/)
