import Resolver from "@forge/resolver";
import { cancelImports, requestImport } from "../lib/import-lifecycle";
import { getLatestManifest, type ImportManifest } from "../lib/kv-data";
import {
  getSchemaAndMapping,
  mapSchema,
  setSchemaAndMapping,
  unmapSchema,
} from "../lib/schema-mapping";

const resolver = new Resolver();

export interface Config {
  // json string
  mapping: string;
}

// Manually defined: this shape is documented at
// https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-service-management-assets-import-type/
// but no corresponding type ships in the @forge dependencies.
export interface ImportContext {
  importId: string;
  workspaceId: string;
}

resolver.define("getConfig", async (req) => {
  console.log(
    `getting configuration for ${req.context.extension.workspaceId} import ${req.context.extension.importId}`,
  );

  const mapping = JSON.stringify(
    unmapSchema(
      await getSchemaAndMapping(
        req.context.extension.workspaceId,
        req.context.extension.importId,
      ),
    ),
    (_, value) => (value === undefined ? null : value),
    2,
  );

  return {
    mapping: mapping,
  };
});

resolver.define("setConfig", async (req) => {
  console.log(
    `saving configuration for ${req.context.extension.workspaceId} import ${req.context.extension.importId}`,
  );

  const mapping = JSON.parse(req.payload.mapping);

  await setSchemaAndMapping(
    req.context.extension.workspaceId,
    req.context.extension.importId,
    mapSchema(
      await getSchemaAndMapping(
        req.context.extension.workspaceId,
        req.context.extension.importId,
      ),
      mapping,
    ),
  );

  return { ok: true };
});

export const handler = resolver.getDefinitions();

export const onDeleteImport = async (context: ImportContext) => {
  await cancelImports(context.workspaceId, context.importId, true);
  return { result: "on delete import" };
};

export interface BeginImportParams {
  workspaceId: string;
  importSourceId: string;
  manifest: ImportManifest;
}

export const beginImport = async ({
  manifest,
  ...scope
}: BeginImportParams): Promise<void> => {
  await requestImport({ ...scope, manifest, testing: manifest.testing });
};

// This begins an import, and is triggered by the _Import data_ button of an
// import instance in the _Schema settings_ -> _Import_ tab.
export const startImport = async (context: ImportContext) => {
  console.log("import with id ", `${context.importId} got started`);

  const manifest = await getLatestManifest();
  if (manifest === undefined) {
    throw new Error("no import manifest found");
  }

  await beginImport({
    workspaceId: context.workspaceId,
    importSourceId: context.importId,
    manifest,
  });

  return {
    result: "start import",
  };
};

// This cancels the current execution of an import.
export const stopImport = async (context: ImportContext) => {
  await cancelImports(context.workspaceId, context.importId);
  return { result: "stop import" };
};

// This is the status of an import itself, NOT the status of an _execution_
// of an import.
export const importStatus = async (_context: ImportContext) => ({
  status: "READY",
});
