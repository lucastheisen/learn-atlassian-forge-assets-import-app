import Resolver from "@forge/resolver";
import { type AssetsClient, assetsClient, unwrap } from "../lib/forge-clients";
import { getLatestManifest, type ImportManifest } from "../lib/kv-data";
import {
  getSchemaAndMapping,
  mapSchema,
  setSchemaAndMapping,
  unmapSchema,
} from "../lib/schema-mapping";
import { workerQueue } from "./worker-resolver";

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
  console.log(`mapping is: ${mapping}`);

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
  console.log("import with id ", `${context.importId} got deleted`);

  return {
    result: "on delete import",
  };
};

export interface BeginImportParams {
  workspaceId: string;
  importSourceId: string;
  manifest: ImportManifest;
}

// Creates an import execution against the given import source and pushes the
// first worker queue item to drive it. Shared by startImport (the real module
// hook, sourced from getLatestManifest()) and the import-start webtrigger
// command (sourced from getLatestManifest() or getLatestTestManifest()
// depending on its testing flag) — see src/lib/kv-data.ts for why those two
// manifest sources never overlap.
// Logs the most recently created execution's status, purely for diagnostics —
// nothing branches on this value. Best-effort: this 404s when the import
// source has never had an execution (e.g. its first-ever run), and that must
// not block starting the import.
const logExecutionStatus = async (
  client: AssetsClient,
  importSourceId: string,
  label: string,
): Promise<void> => {
  const { data, error } = await client.GET(
    "/importsource/{importSourceId}/executions/status",
    {
      headers: {
        Accept: "application/json",
      },
      params: {
        path: {
          importSourceId: importSourceId,
        },
      },
    },
  );

  if (error) {
    console.log(`${label}, unable to fetch latest execution status: `, error);
    return;
  }
  console.log(`${label}, import with id has latest execution: `, data);
};

export const beginImport = async ({
  workspaceId,
  importSourceId,
  manifest,
}: BeginImportParams): Promise<void> => {
  const client = assetsClient(workspaceId);

  await logExecutionStatus(client, importSourceId, "BEFORE STARTING");
  console.log("starting import with manifest: ", manifest);

  const startInfo = await unwrap(
    client.POST("/importsource/{importSourceId}/executions", {
      headers: {
        Accept: "application/json",
      },
      params: {
        path: {
          importSourceId: importSourceId,
        },
      },
    }),
  );

  // executionId is the only part of this link that isn't already known —
  // workspaceId/importSourceId are the trusted params this function was called with.
  const executionIdMatch = new URL(
    startInfo.links.submitProgress,
  ).pathname.match(/\/executions\/(?<executionId>[^/]+)\//);
  if (!executionIdMatch?.groups?.executionId) {
    throw new Error(
      `invalid execution submitProgress link: ${startInfo.links.submitProgress}`,
    );
  }
  const { executionId } = executionIdMatch.groups;

  // Push event onto worker queue to start data ingestion process
  const job = await workerQueue.push({
    body: {
      importSourceId: importSourceId,
      workspaceId: workspaceId,
      executionId: executionId,
      manifest: manifest,
      index: 0,
    },
  });
  console.log(`Pushed worker queue event with id ${job.jobId}`);

  await logExecutionStatus(client, importSourceId, "AFTER STARTING");
};

// This begins an import, and is triggered by the _Import data_ button of an
// import instance in the _Schema settings_ -> _Import_ tab.
export const startImport = async (
  context: ImportContext,
  ...args: unknown[]
) => {
  console.debug(
    `start import: ${JSON.stringify(context, null, 2)}, remaining args: ${JSON.stringify(args, null, 2)}`,
  );
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
  console.log("import with id ", `${context.importId} got stopped`);

  const client = assetsClient(context.workspaceId);
  const status = await unwrap(
    client.GET("/importsource/{importSourceId}/executions/status", {
      headers: {
        Accept: "application/json",
      },
      params: {
        path: {
          importSourceId: context.importId,
        },
      },
    }),
  );
  console.log("import with id has latest execution: ", status);

  await unwrap(
    client.DELETE(
      "/importsource/{importSourceId}/executions/{importExecutionId}",
      {
        headers: {
          Accept: "application/json",
        },
        params: {
          path: {
            importSourceId: context.importId,
            importExecutionId: status.executionId,
          },
        },
      },
    ),
  );

  return {
    result: "stop import",
  };
};

// This is the status of an import itself, NOT the status of an _execution_
// of an import.
export const importStatus = async (
  context: ImportContext,
  ...args: unknown[]
) => {
  console.debug(
    `import status: ${JSON.stringify(context, null, 2)}, remaining args: ${JSON.stringify(args, null, 2)}`,
  );
  const status = "READY";

  //const client = assetsClient(context.workspaceId);
  //const { data, error } = await client.POST(
  //  "/importsource/{importSourceId}/executions",
  //  {
  //      headers: {
  //        "Accept": "application/json",
  //      },
  //      params: {
  //        path: {
  //          importSourceId: context.importId,
  //        },
  //      },
  //  });
  //if (error) {
  //  throw new Error(`unable to create execution: ${JSON.stringify(error)}`);
  //}
  //if (!data) {
  //  throw new Error(`data empty execution`);
  //}

  //const startInfo = data as StartInfo;

  console.log(
    `import with id `,
    `${context.importId} sending import progress ${status}`,
  );

  return {
    status: status,
  };
};
