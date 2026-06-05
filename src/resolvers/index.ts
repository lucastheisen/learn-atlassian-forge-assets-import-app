import api, { route } from "@forge/api";
import { kvs } from '@forge/kvs';
import Resolver from '@forge/resolver';
import { assetsClient, unwrap } from "../lib/forge-clients"
import { getSchemaAndMapping, mapSchema, setSchemaAndMapping, unmapSchema } from "../lib/schema-mapping";
import { controllerQueue } from './controller-resolver';
import { getLatestManifest } from "../lib/kv-data";

const resolver = new Resolver();

export interface Config {
  accessKeyId: string;
  hasSecretAccessKey: boolean;
  // json string
  mapping: string;
  // json string
  importData: string;
}

// seems to be defined here:
//   https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-service-management-assets-import-type/
// but also no types found in current deps:
//   ltheisen@mm292985-pc ~/egit/lucastheisen-learn-atlassian-forge-assets-import-app
//   $ grep -rE 'workspaceId\??:' node_modules/@forge/ -C 10 | grep schema
//
//   ltheisen@mm292985-pc ~/egit/lucastheisen-learn-atlassian-forge-assets-import-app
//   $
export interface ImportContext {
  importId: string
  workspaceId: string
}

resolver.define('getConfig', async(req) => {
  console.log(`getting configuration for ${req.context.extension.workspaceId} import ${req.context.extension.importId}`);

  const key = configKey(req.context.extension.workspaceId, req.context.extension.importId);
  const raw = await kvs.getSecret<string>(key);
  console.log(`loaded <<<${raw}>>>`);

  const mapping = JSON.stringify(
    unmapSchema(
      await getSchemaAndMapping(
        req.context.extension.workspaceId,
        req.context.extension.importId,
        req.context.extension.schemaId)),
    (_, value) => value === undefined ? null : value,
    2);
  console.log(`mapping is: ${mapping}`);

  if (!raw) {
    return {
      accessKeyId: "",
      hasSecretAccessKey: false,
      importData: "",
      mapping: mapping,
    };
  }

  const config = JSON.parse(raw);
  return {
    accessKeyId: config.accessKeyId,
    hasSecretAccessKey: !!config.secretAccessKey,
    importData: config.importData,
    mapping: mapping,
  };
})

resolver.define('getText', (req) => {
  console.log(req);
  return `Hello! Your payload is ${req.payload.example}`;
});

resolver.define('newToken', async (req) => {
  // https://developer.atlassian.com/cloud/assets/rest/api-group-importsource/#api-importsource-importsourceid-token-post
  console.log(`generating new token for ${req.context.extension.workspaceId} import ${req.context.extension.importId}`);
  console.log(req);
  const resp = await api
    .asApp()
    .requestJira(
      route`/jsm/assets/workspace/${req.context.extension.workspaceId}/v1/importsource/${req.context.extension.importId}/token`,
      {
        method: "POST",
      }
    );
  const data = await resp.json();
  return data.token;
});

resolver.define('setConfig', async(req) => {
  console.log(`saving configuration for ${req.context.extension.workspaceId} import ${req.context.extension.importId}`);

  const key = configKey(req.context.extension.workspaceId, req.context.extension.importId);
  const raw = await kvs.getSecret<string>(key);

  const config = raw ? JSON.parse(raw) : {};
  const newConfig = {
    accessKeyId: req.payload.accessKeyId,
    secretAccessKey: req.payload.isEditSecretAccessKey ? req.payload.secretAccessKey : config.secretAccessKey,
    importData: req.payload.importData,
  }

  const newValue = JSON.stringify(newConfig);
  console.log(`saving <<<${newValue}>>>`);
  await kvs.setSecret(key, newValue);

  const mapping = JSON.parse(req.payload.mapping)

  await setSchemaAndMapping(
    req.context.extension.workspaceId,
    req.context.extension.importId,
    mapSchema(
      await getSchemaAndMapping(
        req.context.extension.workspaceId,
        req.context.extension.importId,
        req.context.extension.schemaId),
      mapping))

  return { ok: true }
})

export const configKey = (workspaceId: string, importId: string) => `assets-import-config:${workspaceId}:${importId}`;

export const handler = resolver.getDefinitions();

export const onDeleteImport = async (context: ImportContext) => {
  console.log('import with id ', `${context.importId} got deleted`);

  return {
    result: 'on delete import'
  };
};

// This begins an import, and is triggered by the _Import data_ button of an
// import instance in the _Schema settings_ -> _Import_ tab.
export const startImport = async (context: ImportContext, ...args: unknown[]) => {
  console.debug(
    `start import: ${JSON.stringify(context, null, 2)}, remaining args: ${JSON.stringify(args, null, 2)}`
  );
  console.log('import with id ', `${context.importId} got started`);

  const manifest = await getLatestManifest()
  if (manifest === undefined) {
    throw new Error("no import manifest found");
  }

  const client = assetsClient(context.workspaceId);

  const statusBefore = await unwrap(client.GET(
    "/importsource/{importSourceId}/executions/status",
    {
        headers: {
          "Accept": "application/json",
        },
        params: {
          path: {
            importSourceId: context.importId,
          },
        },
    }));

  console.log('BEFORE STARTING, import with id has latest execution: ', statusBefore, 'with manifest: ', manifest);

  const startInfo = await unwrap(client.POST(
    "/importsource/{importSourceId}/executions",
    {
      headers: {
        "Accept": "application/json",
      },
      params: {
        path: {
          importSourceId: context.importId,
        },
      },
    }));

  const idsMatch = new URL(startInfo.links.submitProgress).pathname.match(
    /\/workspace\/(?<workspaceId>[^/]+)\/v1\/importsource\/(?<importSourceId>[^/]+)\/executions\/(?<executionId>[^/]+)\//
  );
  if (
      !idsMatch?.groups?.workspaceId
      || !idsMatch?.groups?.importSourceId
      || !idsMatch?.groups?.executionId) {
    throw new Error(`invalid execution submitProgress link: ${startInfo.links.submitProgress}`);
  }
  const { workspaceId, importSourceId, executionId } = idsMatch.groups;

  // Push event onto controller queue to start data ingestion process
  const job = await controllerQueue.push(
    {
      body: {
        importSourceId: importSourceId,
        workspaceId: workspaceId,
        executionId: executionId,
        manifest: manifest,
        index: 0,
      }
    });
  console.log(`Pushed queueControllerEvent with id ${job.jobId}`);

  setJobId(importSourceId, job.jobId)

  const statusAfter = await unwrap(client.GET(
    "/importsource/{importSourceId}/executions/status",
    {
        headers: {
          "Accept": "application/json",
        },
        params: {
          path: {
            importSourceId: context.importId,
          },
        },
    }));
  console.log('AFTER STARTING, import with id has latest execution: ', statusAfter);

  return {
    result: 'start import'
  };
};

// This cancels the current execution of an import.
export const stopImport = async (context: ImportContext) => {
  console.log('import with id ', `${context.importId} got stopped`);

  const client = assetsClient(context.workspaceId);
  const status = await unwrap(client.GET(
    "/importsource/{importSourceId}/executions/status",
    {
        headers: {
          "Accept": "application/json",
        },
        params: {
          path: {
            importSourceId: context.importId,
          },
        },
    }));
  console.log('import with id has latest execution: ', status);

  await unwrap(client.DELETE(
    "/importsource/{importSourceId}/executions/{importExecutionId}",
    {
        headers: {
          "Accept": "application/json",
        },
        params: {
          path: {
            importSourceId: context.importId,
            importExecutionId: status.executionId,
          },
        },
    }));

  return {
    result: 'stop import'
  };
};

// This is the status of an import itself, NOT the status of an _execution_
// of an import.
export const importStatus = async (context: ImportContext, ...args: unknown[]) => {
  console.debug(
    `import status: ${JSON.stringify(context, null, 2)}, remaining args: ${JSON.stringify(args, null, 2)}`
  );
  const status = 'READY';

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

  console.log(`import with id `, `${context.importId} sending import progress ${status}`);

  return {
    status: status
  };
};

const deleteJobId = async (importSourceId: string) => {
  return await kvs.delete(jobKey(importSourceId));
}

const getJobId = async (importSourceId: string) => {
  return await kvs.get<string>(jobKey(importSourceId));
}

const setJobId = async (importSourceId: string, jobId: string) => {
  await kvs.set(jobKey(importSourceId), jobId);
}

const jobKey = (importSourceId: string) => {
  return `import:${importSourceId}:jobId`
}
