import type { Installation } from '@forge/api/out/api/runtime';
import { type AsyncEvent, Queue } from '@forge/events';
import type { Body } from '@forge/events/out/types';
import { getImportData, type ImportManifest } from '../lib/kv-data';
import { assetsClient, unwrap } from '../lib/forge-clients';

// The responsibility of the worker queue is to fetch data from the external system
// and submit that data to CMDB. Since data most likely will be fetched in batches,
// the worker queue will keep pushing to itself (worker) until all data is fetched and submitted.
// The final push sets completed=true, which tells the Assets backend it received the
// last chunk and may begin the (asynchronous) import work.


// the key here becomes the queueName in the async event argument to the handler
export const workerQueue = new Queue<WorkItem>({ key: 'worker-queue' });

interface WorkItem extends Body {
  importSourceId: string
  workspaceId: string
  executionId: string
  manifest: ImportManifest
  index: number
}

// Manually defined: @forge/events ships no type for the second workerHandler
// argument, reverse-engineered from the runtime's actual v1-shaped payload —
// see https://developer.atlassian.com/platform/forge/runtime-reference/async-events-api-version-2-upgrade/
interface HandlerContext {
  installContext: `ari:${string}`
  installation: Installation
}

export const workerHandler = async (event: AsyncEvent<WorkItem>, context: HandlerContext): Promise<void> => {
  console.debug(
    `Entering worker-queue-listener with jobId ${event.jobId} for importSourceId ${event.body.importSourceId} index ${event.body.index} installContext ${context.installContext}`
  );

  const data = await getImportData(event.body.manifest, event.body.index)
  if (data === undefined) {
    throw new Error(`no import data found for manifest index ${event.body.index}`);
  }
  const lastBatch = event.body.index === (event.body.manifest.totals.keys - 1)

  const client = assetsClient(event.body.workspaceId);
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
    const progress = {
      objects: {
        total: event.body.manifest.totals.keys,
        processed: event.body.index + 1,
      },
    };
    // dont unwrap, because unwrap converts error object to thrown error which
    // would stop the import, and progress update is simply best effort — but
    // still await and log failures so they're not silently ignored, and so
    // the call actually completes before this function returns
    const { error: progressError } = await client.PUT(
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
    if (progressError) {
      console.warn(
        `progress update failed for importSourceId ${event.body.importSourceId} index ${event.body.index}: ${JSON.stringify(progressError)}`
      );
    }

    const _id = await workerQueue.push({
      body: {
        ...event.body,
        index: event.body.index + 1,
      },
    });
  }
}
