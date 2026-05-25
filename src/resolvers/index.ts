import api, { route } from "@forge/api";
import { kvs } from '@forge/kvs';
import Resolver from '@forge/resolver';
import { assetsClient } from "../lib/forge-clients"
import { getSchemaAndMapping, mapSchema, setSchemaAndMapping, unmapSchema } from "../lib/schema-mapping";
import { controllerQueue } from './controller-resolver';

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

// json schema shows this structure in an example:
//   @example {
//         "links": {
//           "submitProgress": "https://api.atlassian.com/jsm/insight/workspace/fd8d86e0-3401-40bd-adb4-bb50b8e39288/v1/importsource/4d4095c3-cb7c-4d59-9b75-a381ea4b1975/executions/07a58b26-e93a-49c6-9381-1fe235943018/progress",
//           "submitResults": "https://api.atlassian.com/jsm/insight/workspace/fd8d86e0-3401-40bd-adb4-bb50b8e39288/v1/importsource/4d4095c3-cb7c-4d59-9b75-a381ea4b1975/executions/07a58b26-e93a-49c6-9381-1fe235943018/data",
//           "getExecutionStatus": "https://api.atlassian.com/jsm/insight/workspace/fd8d86e0-3401-40bd-adb4-bb50b8e39288/v1/importsource/4d4095c3-cb7c-4d59-9b75-a381ea4b1975/executions/07a58b26-e93a-49c6-9381-1fe235943018/status",
//           "cancel": "https://api.atlassian.com/jsm/insight/workspace/fd8d86e0-3401-40bd-adb4-bb50b8e39288/v1/importsource/4d4095c3-cb7c-4d59-9b75-a381ea4b1975/executions/07a58b26-e93a-49c6-9381-1fe235943018"
//         },
//         "result": "success"
//       }
// but does not flesh it out as an object so we just describe here for clarity
export interface StartInfo {
  links: {
    submitProgress: string
    submitResults: string
    getExecutionStatus: string
    cancel: string
  },
  result: string
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

export interface StatusInfo {
  executionId: string
  status: string
}

export const handler = resolver.getDefinitions();
export const onDeleteImport = async (context: ImportContext) => {
  console.log('import with id ', `${context.importId} got deleted`);

  return {
    result: 'on delete import'
  };
};

export const startImport = async (context: ImportContext, ...args: unknown[]) => {
  console.debug(
    `start import: ${JSON.stringify(context, null, 2)}, remaining args: ${JSON.stringify(args, null, 2)}`
  );
  console.log('import with id ', `${context.importId} got started`);

  const client = assetsClient(context.workspaceId);

  const statusResp = await client.GET(
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
    });
  if (statusResp.error) {
    throw new Error(`unable to get status for execution: ${JSON.stringify(statusResp.error)}`);
  }
  if (!statusResp.data) {
    throw new Error(`data empty status for execution`);
  }

  const statusInfo = statusResp.data as StatusInfo;
  console.log('BEFORE STARTING, import with id has latest execution: ', statusInfo);

  const { data, error } = await client.POST(
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
    });
  if (error) {
    throw new Error(`unable to create execution: ${JSON.stringify(error)}`);
  }
  if (!data) {
    throw new Error(`data empty execution`);
  }

  const startInfo = data as StartInfo;
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
        skip: 0,
        limit: 30,
        total: 0,
      }
    });
  console.log(`Pushed queueControllerEvent with id ${job.jobId}`);

  setJobId(importSourceId, job.jobId)

  const statusRespAfter = await client.GET(
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
    });
  if (statusRespAfter.error) {
    throw new Error(`unable to get status for execution: ${JSON.stringify(statusRespAfter.error)}`);
  }
  if (!statusRespAfter.data) {
    throw new Error(`data empty status for execution`);
  }

  const statusInfoAfter = statusRespAfter.data as StatusInfo;
  console.log('AFTER STARTING, import with id has latest execution: ', statusInfoAfter);

  return {
    result: 'start import'
  };
};

export const stopImport = async (context: ImportContext) => {
  console.log('import with id ', `${context.importId} got stopped`);

  const client = assetsClient(context.workspaceId);
  const statusResp = await client.GET(
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
    });
  if (statusResp.error) {
    throw new Error(`unable to get status for execution: ${JSON.stringify(statusResp.error)}`);
  }
  if (!statusResp.data) {
    throw new Error(`data empty status for execution`);
  }

  const statusInfo = statusResp.data as StatusInfo;
  console.log('import with id has latest execution: ', statusInfo);

  const { error } = await client.DELETE(
    "/importsource/{importSourceId}/executions/{importExecutionId}",
    {
        headers: {
          "Accept": "application/json",
        },
        params: {
          path: {
            importSourceId: context.importId,
            importExecutionId: statusInfo.executionId,
          },
        },
    });
  if (error) {
    throw new Error(`unable to delete execution: ${JSON.stringify(error)}`);
  }

  return {
    result: 'stop import'
  };
};

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
