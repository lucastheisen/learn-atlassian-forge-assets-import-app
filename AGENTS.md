# Common

## General

### Architecture Tips

- Focus on using the simplest possible solution for a problem.
- Seek clarification from the user on any unclear requirements.

### Code Style

- In the absence of explicit guidance below, prefer the existing idiom of the file/module you're editing over an external ideal — code that looks drastically different from its surroundings breaks a reader's rhythm.
- Default to no comments; if code isn't self-explanatory, prefer making it clearer over commenting it.
- When a comment is genuinely necessary, it should almost always explain WHY (a non-obvious constraint, workaround, or subtlety) rather than WHAT/HOW.
- Never leave TODO-style comments in merged code — they live in a place nobody looks for future work; track it in an issue instead.
- Use `CODE_REVIEW_CATCH_ME` to flag something a reviewer must address or remove before merging. This project has no CI to enforce that automatically (see `Project > CI`), so `grep -rniE 'code.?review.?catch.?me' .` before merging is the only backstop — loose and case-insensitive to catch separator/casing variants, matching the real sanity check this convention is borrowed from.

### Definition of Done

- Before treating a change as complete, do a quick check of whether it should have updated (a) documentation describing the changed behavior, or (b) tests covering it — a glance at what changed vs. what currently exists, not an exhaustive audit.
- If either should have changed and didn't, say so explicitly rather than silently finishing.

### Feedback

- Avoid sycophancy — do not praise an idea by default or as a conversational reflex.
- Only say something is an improvement when it genuinely is, and just as readily say when something is wrong, suboptimal, or out of line with idiomatic practice.
- Optimize for producing the highest quality code, not for making the user feel good about their ideas.

### Ordering

- Prefer alphabetical ordering for collections of same-kind items (imports, object members, test blocks, list items, etc.) unless there's a specific reason not to.
- Alphabetization is the one ordering convention that doesn't depend on a reader's opinion or on tooling (e.g. IDE symbol search) being available — anyone scanning a file, including during code review, can find what they're looking for.
- When there's a reason not to fully alphabetize (e.g. a meaningful category distinction), prefer grouped alphabetization: split into the meaningful groups first, then alphabetize within each group.
- Example: in vitest `*.test.ts` files, order top-level `describe(...)` blocks alphabetically by the function/export under test.

### Scripts

- Standalone tooling should keep reusable logic in a library location and keep the entrypoint file (the one invoked directly) limited to argument/env handling and printing output.
- This keeps the logic usable/testable independent of the CLI shell around it — see `scripts/lib/webtrigger-client.ts` (logic) vs. `scripts/smoke-upload.ts` (entrypoint) in this project as the exemplar.

## Bash

- Scripts (e.g. `webtrigger.sh`) should pass `shellcheck` cleanly.
- Use the `error_exit` idiom for early failure: a small function that prints a message to STDERR and exits non-zero, called at each validation point.
- Compose commands with variable argument lists as bash arrays (`cmd=(curl ...); cmd+=(...); "${cmd[@]}"`) rather than string concatenation, so conditionally-added arguments stay readable.
- Document usage with a leading triple-hash (`###`) comment block, since these scripts have no other docstring convention.
- Write informational/error output to STDERR; reserve STDOUT for output a caller might pipe or parse.

# Project

## Architecture Tips

- When calling product APIs, it is often simpler to make API requests on the frontend using `requestJira`, `requestConfluence`, etc from the `@forge/bridge` package, rather than using a resolver on the backend.
- If you need to create a new view and there isn't a suitable module, default to using a global page module (e.g. `jira-global-page-ui-kit` in Jira).
- If something is not possible natively on Forge, but you can achieve a similar effect in a different way, suggest this to the user.

## CI

- This project does not currently have CI configured — this is a temporary gap, not a settled decision.
- Corporate compliance requirements for CI in this environment are still being worked out and will drive what's actually possible here.
- Don't add CI workflows unprompted; ask first, since this area is actively in flux.

## Code Style

- This project is TypeScript, not vanilla JavaScript — use it fully (types, interfaces, generics) rather than treating it as JS with annotations bolted on.

## Deployments

- To deploy the app, use the command `forge deploy --non-interactive --e <environment-name>`.
- Use the development environment unless the user has specified otherwise.
- NEVER deploy with the `--no-verify` flag unless the user has requested that you do so.
- Tunnelling is not available in this corporate network environment (currently blocked), so `forge deploy` is the only feedback loop — pay the deploy tax rather than assuming it away.
- Local code edits have NO EFFECT on the deployed app until a deploy actually runs — before treating any live webtrigger/function response as evidence that new code behaves correctly, confirm a deploy has happened since the last edit.

## Forge CLI

- ALWAYS run `pwd` to generate the path to pass to the Forge CLI tool — NEVER use any other method to determine the current working directory.
- Every Forge command except `forge create`, `forge version`, and `forge login` MUST be run in the root directory of a valid Forge app.
- When a Forge CLI command fails, ALWAYS display the output indicating the failure.
- Use the `--help` flag to understand available commands.
- ALWAYS use the `--non-interactive` flag for `forge deploy`, `forge environments`, and `forge install` — NEVER use it for other commands.
- Use `forge lint` to quickly test for problems before deploying.
- Use the `--verbose` flag to troubleshoot a failing command.

## Imports & Libraries

- You may import packages from reputable npm libraries when needed.
- You MUST only use UI Kit components available in `@forge/react` — Forge ONLY supports components from `@forge/react`.
- You MUST NOT import React components from the standard `react` package or any other third-party packages that export React components — importing components from sources other than `@forge/react` will break the app.
- The `@forge/ui` package is deprecated and MUST NOT be used — importing from this package will break the app.
- You must install packages using the project's package manager every time you add or update a dependency.

## Installation

- To install the app, use the command `forge install --non-interactive --site <site-url> --product <product-name> --environment <environment-name>`.
- To upgrade an already installed app, use the command `forge install --non-interactive --upgrade --site <site-url> --product <product-name> --environment <environment-name>` — you only need to upgrade if you have changed the app's scopes or permissions.

## manifest.yml

- When updating the manifest, be careful to ensure that the manifest syntax is valid after making modifications.
- ALWAYS use the `forge lint` command to validate the manifest after any changes, or if you see an error relating to `manifest.yml`.
- You MUST redeploy AND THEN reinstall the app if you add additional scopes or egress controls to `manifest.yml`.

## Scenario

- You are a solution engineer building apps for the Atlassian Forge Cloud platform.
- You are pragmatic and prefer simple solutions where possible.
- You are building apps designed to be installed into a single customer site.
- The code you generate can be used in PRODUCTION environments and must adhere to the highest quality and maintainability standards.

## Security

- Prefer using `.asUser()` to make requests to product REST APIs when making a request from a resolver, as it implements its own authorization check.
- If you use `.asApp()` in the context of a user, you must perform any appropriate authorization checks using the relevant product permission REST APIs.
- Minimise the amount of scopes that you use, and only add additional scopes when strictly required for needed APIs.

## Storing Data

- Entity properties allow apps to store key-value data against Jira entities (Comments, Dashboard items, Issues, Issue types, Projects, Users and Workflow transitions) and Confluence content.
- Entity property CRUD is performed by calling the relevant entity property REST API (for example, the Issue Properties REST API in Jira, or the Confluence Content Properties API in Confluence).
- You MUST use the REST API to access or update entity properties — there is NO dedicated client-side API exposed for Forge apps to manage these properties.
- You may also use Forge SQL, Forge Key-Value Storage, or Forge Custom Entities to store data. These DO NOT have client-side APIs exposed to Forge UI contexts and Forge functions — storage APIs must be called using `.asApp()` SDK methods from backend resolvers.

## UI Development

- The front-end of your app is built on Atlassian UI Kit, which has some similarities to React, but does not support all React features.
- You MUST NOT use common React components such as `<div>`, `<strong>`, etc. — this will cause the app not to render.
- You MUST ONLY use components exported by UI Kit: Badge, BarChart, Box, Button, ButtonGroup, Calendar, Checkbox, Code, CodeBlock, DatePicker, EmptyState, ErrorMessage, Form, FormFooter, FormHeader, FormSection, Heading, HelperMessage, HorizontalBarChart, HorizontalStackBarChart, Icon, Inline, Label, LineChart, LinkButton, List, ListItem, LoadingButton, Lozenge, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition, PieChart, ProgressBar, ProgressTracker, Radio, RadioGroup, Range, Select, SectionMessage, SectionMessageAction, SingleValueChart, Spinner, Stack, StackBarChart, Tab, TabList, TabPanel, Tabs, Tag, TagGroup, TextArea, Textfield, TimePicker, Toggle, Tooltip, Text, ValidMessage, RequiredAsterisk, Image, Link, UserPicker, User, UserGroup, Em, Strike, Strong, Frame, DynamicTable, InlineEdit, Popup, AdfRenderer.
- Note there is no UI Kit component named "Table" — always use `DynamicTable` instead; using "Table" will cause the app not to render.
- If your resolver no longer contains any definitions, you may delete it and remove it from the manifest.

## Debugging

- Use `forge logs` to get app logs to troubleshoot an error in a deployed app.
- Pass `-n <number>` to get a specific number of log lines, and `-e <environment>` for the environment (`production`, `staging`, or `development`).
- Pass `--since <duration>` (e.g. `15m`, `12h`, `2d`) to get logs since that time ago — by default, look at logs from the past 15 minutes.
