import api, { route } from "@forge/api";
import Resolver from '@forge/resolver';
import { controllerQueue } from './controller-resolver';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);
  return `Hello! Your payload is ${req.payload["example"]}`;
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
  const data = await resp.json()
  return data["token"]
});

export const handler = resolver.getDefinitions();
export const onDeleteImport = async (context) => {
  console.log('import with id ', context.importId + ' got deleted');

  return {
    result: 'on delete import'
  };
};

export const startImport = async (context) => {
  console.log('import with id ', context.importId + ' got started');

  // Call Assets API here to mark import as started
  const resp = await api
    .asApp()
    .requestJira(
      route`/jsm/assets/workspace/${context.workspaceId}/v1/importsource/${context.importId}`,
      {
        method: "GET",
      }
    );
  console.log("import source is:")
  console.log(await resp.json())
  console.log("the end")

  // Push event onto controller queue to start data ingestion process
  const id = await controllerQueue.push({ body: { eventContext: { importConfigurationId: context.importId } } });
  console.log(`Pushed queueControllerEvent with id ${id}`);

  return {
    result: 'start import'
  };
};

export const stopImport = async (context) => {
  console.log('import with id ', context.importId + ' got stopped');

  return {
    result: 'stop import'
  };
};

export const importStatus = async (context) => {
  const status = 'READY';

  console.log(`import with id `, context.importId + ` sending import progress ${status}`);

  return {
    status: status
  };
};
