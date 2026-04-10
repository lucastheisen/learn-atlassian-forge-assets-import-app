import api, { route } from "@forge/api";
import Resolver from '@forge/resolver';
import { controllerQueue } from './controller-resolver';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);
  return `Hello, there mr lucas! Your payload is ${req.payload["example"]}`;
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
