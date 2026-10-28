import { runImportSmoke } from "./lib/import-smoke.js";

const url = process.env.FORGE_WEBTRIGGER_URL;
const secret = process.env.FORGE_WEBTRIGGER_SECRET;
const workspaceId = process.env.FORGE_SMOKE_WORKSPACE_ID;
const importSourceId = process.env.FORGE_SMOKE_IMPORT_SOURCE_ID;
if (!url || !secret || !workspaceId || !importSourceId) {
  throw new Error(
    "FORGE_WEBTRIGGER_URL, FORGE_WEBTRIGGER_SECRET, FORGE_SMOKE_WORKSPACE_ID and FORGE_SMOKE_IMPORT_SOURCE_ID are required; see docs/DEVELOPMENT.md",
  );
}
await runImportSmoke(
  { url, secret },
  { workspaceId, importSourceId },
  process.env.FORGE_SMOKE_USER_EMAIL,
);
