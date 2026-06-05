import type { Installation } from '@forge/api/out/api/runtime';
import { type AsyncEvent, Queue } from '@forge/events';
import { Body } from '@forge/events/out/types';
import { getData, ImportManifest } from '../lib/kv-data';
import { type AssetsClient, assetsClient, unwrap } from '../lib/forge-clients';
import { ModalBody } from '@forge/react';

// The responsibility of the worker queue is to fetch data from the external system
// and submit that data to CMDB. Since data most likely will be fetched in batches,
// the worker queue will keep pushing to itself (worker) until all data is fetched and submitted
// At which point it should mark the work items as complete so that the controller queue can
// call the Assets API to signal the completion of data submission


// the key here becomes the queueName in the async event argument to the handler
export const workerQueue = new Queue<WorkItem>({ key: 'worker-queue' });

interface WorkItem extends Body {
  importSourceId: string
  workspaceId: string
  executionId: string
  manifest: ImportManifest
  index: number
}

// the only place i could find installContext next to installation:
//   ltheisen@mm292985-pc ~/egit/lucastheisen-learn-atlassian-forge-assets-import-app
//   $ grep -rE 'installation\??:' -C 15 node_modules/@forge/ | grep -C 20 installContext
//   node_modules/@forge/resolver/out/index.js-    }
//   node_modules/@forge/resolver/out/index.js-    sanitizeObject(object) {
//   node_modules/@forge/resolver/out/index.js-        return JSON.parse(JSON.stringify(object));
//   node_modules/@forge/resolver/out/index.js-    }
//   node_modules/@forge/resolver/out/index.js-    getDefinitions() {
//   node_modules/@forge/resolver/out/index.js-        return async ({ call: { functionKey, payload, jobId }, context }, backendRuntimePayload) => {
//   node_modules/@forge/resolver/out/index.js-            const cb = this.getFunction(functionKey);
//   node_modules/@forge/resolver/out/index.js-            const result = await cb({
//   node_modules/@forge/resolver/out/index.js-                payload: payload || {},
//   node_modules/@forge/resolver/out/index.js-                context: {
//   node_modules/@forge/resolver/out/index.js-                    ...context,
//   node_modules/@forge/resolver/out/index.js-                    installContext: backendRuntimePayload?.installContext,
//   node_modules/@forge/resolver/out/index.js-                    accountId: backendRuntimePayload?.principal?.accountId,
//   node_modules/@forge/resolver/out/index.js-                    license: backendRuntimePayload?.license,
//   node_modules/@forge/resolver/out/index.js-                    jobId: jobId,
//   node_modules/@forge/resolver/out/index.js:                    installation: backendRuntimePayload?.installation
//   node_modules/@forge/resolver/out/index.js-                }
//   node_modules/@forge/resolver/out/index.js-            });
//   node_modules/@forge/resolver/out/index.js-            if (typeof result === 'object') {
//   node_modules/@forge/resolver/out/index.js-                return this.sanitizeObject(result);
//   node_modules/@forge/resolver/out/index.js-            }
//   node_modules/@forge/resolver/out/index.js-            return result;
//   node_modules/@forge/resolver/out/index.js-        };
//   node_modules/@forge/resolver/out/index.js-    }
//   node_modules/@forge/resolver/out/index.js-}
//   node_modules/@forge/resolver/out/index.js-exports.default = Resolver;
//   node_modules/@forge/resolver/out/index.js-/**
//   node_modules/@forge/resolver/out/index.js- * Creates resolver definitions corresponding to a given Definitions type.
//   node_modules/@forge/resolver/out/index.js- *
//   node_modules/@forge/resolver/out/index.js- * @param handlers Resolver functions implementing the definitions
//   node_modules/@forge/resolver/out/index.js- * @returns Resolver definitions
// is not a type...  not sure this is correct but it does experimentally match
// the log messages i was getting that dumped the context.
interface HandlerContext {
  // closest i could find was
  //   ltheisen@mm292985-pc ~/egit/lucastheisen-learn-atlassian-forge-assets-import-app
  //   $ grep -rE 'installContext' -C 1 node_modules/@forge/api/out/webTrigger.d.ts
  //   export interface WebTriggerContext {
  //       installContext: `ari:${string}`;
  //   }
  installContext: `ari:${string}`
  installation: Installation
}

// CODE_REVIEW_CATCH_ME
// originally this method signature in js was:
//   export async function workerHandler(event, context) {
// from the log, it seems to be this:
//   event ->
//     body:
//       eventContext:
//         workId: your-work-id
//     context:
//       cloudId: b5949b64-9c12-406c-81f1-88e1b895cdec
//       moduleKey: assets-import-app-uk2-assets-imports-tutorial-worker-queue-consumer
//       userAccess:
//         enabled: false
//     contextToken: eyJ...DXQ
//     eventId: 1e788828-ca0d-4d23-87a2-1a9229697372
//     jobId: 79c0704d-4fb6-4dcf-b064-a1f642296a18
//     queueName: worker-queue
//   context ->
//     installContext: ari:cloud:jira::site/b5949b64-9c12-406c-81f1-88e1b895cdec
//     installation:
//       ari:
//         installationId: d252ba29-ab1f-42e3-aba9-ebf702ccf181
//       contexts:
//       - cloudId: b5949b64-9c12-406c-81f1-88e1b895cdec
//         workspaceId: adfb4132-4e99-4416-ad76-489b41d545ae
// which appears to be version 1 event handler
//   https://developer.atlassian.com/platform/forge/runtime-reference/async-events-api-version-2-upgrade/
// even though we are @forge/events version 2 in our package.json and the
// ibuchanan example has this version 2 format (though not sure if/how it will work):
export const workerHandler = async (event: AsyncEvent<WorkItem>, context: HandlerContext): Promise<void> => {
  console.debug(
    `Entering worker-queue-listener with event: ${JSON.stringify(event, null, 2)} and context: ${JSON.stringify(context, null, 2)}`
  );

  const data = await getData(event.body.manifest, event.body.index)
  const lastBatch = event.body.index === (event.body.manifest.totals.keys - 1)

  const client = assetsClient(event.body.workspaceId);
  // CODE_REVIEW_CATCH_ME: update json to add type to body
  await unwrap(client.POST(
    "/importsource/{importSourceId}/executions/{importExecutionId}/data",
    {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          path: {
            importSourceId: event.body.importSourceId,
            importExecutionId: event.body.executionId,
          },
        },
        body: {
          data: data,
          clientGeneratedId: "",
          completed: lastBatch,
        },
    }));

  if (!lastBatch) {
    // CODE_REVIEW_CATCH_ME: patch openapi json to add type to body
    const progress = {
      total: event.body.manifest.totals.keys,
      processed: event.body.index + 1,
    };
    // dont unwrap, because unrap converts error object to thrown error which
    // would stop the import, and progress update is simply best effort
    client.PUT(
      "/importsource/{importSourceId}/executions/{importExecutionId}/progress",
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          path: {
            importSourceId: event.body.importSourceId,
            importExecutionId: event.body.executionId,
          },
        },
        body: progress,
      });

    const _id = await workerQueue.push({
      body: {
        ...event.body,
        index: event.body.index + 1,
      },
    });
  }
}
