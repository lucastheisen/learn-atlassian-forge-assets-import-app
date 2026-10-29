import z from "zod";
import { runImportSmoke } from "./lib/import-smoke.js";

const importSourceId = process.env.FORGE_SMOKE_IMPORT_SOURCE_ID;

const secret = process.env.FORGE_WEBTRIGGER_SECRET;

const url = process.env.FORGE_WEBTRIGGER_URL;

const workspaceId = process.env.FORGE_SMOKE_WORKSPACE_ID;

if (!url || !secret || !workspaceId || !importSourceId) {
  throw new Error(
    "FORGE_WEBTRIGGER_URL, FORGE_WEBTRIGGER_SECRET, FORGE_SMOKE_WORKSPACE_ID and FORGE_SMOKE_IMPORT_SOURCE_ID are required. See docs/DEVELOPMENT.md",
  );
}

await runImportSmoke(
  { secret, url },
  { importSourceId, workspaceId },
  process.env.FORGE_SMOKE_USER_EMAIL,
  process.env.FORGE_SMOKE_REPORT_FILE,
  {
    pollTimeoutMs:
      process.env.FORGE_SMOKE_POLL_TIMEOUT_MS === undefined
        ? undefined
        : Number(process.env.FORGE_SMOKE_POLL_TIMEOUT_MS),
    requireContinuation:
      z
        .enum(["false", "true"])
        .default("false")
        .parse(process.env.FORGE_SMOKE_REQUIRE_CONTINUATION) === "true",
    userCount:
      process.env.FORGE_SMOKE_USER_COUNT === undefined
        ? undefined
        : Number(process.env.FORGE_SMOKE_USER_COUNT),
  },
);
