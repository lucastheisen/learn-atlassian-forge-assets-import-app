import type { Installation } from '@forge/api/out/api/runtime';
import { type AsyncEvent, Queue } from '@forge/events';
import type { Body } from '@forge/events/out/types';
import { workerQueue } from './worker-resolver';
import { ImportManifest } from '../lib/kv-data';
import { eventLoopUtilization } from 'node:perf_hooks';

export const controllerQueue = new Queue<ControllerWorkItem>({ key: 'controller-queue' });

// see worker-resolver.ts for explaination
interface HandlerContext {
  installContext: `ari:${string}`
  installation: Installation
}

export interface ControllerWorkItem extends Body {
  importSourceId: string
  workspaceId: string
  executionId: string
  manifest: ImportManifest
  index: number
}

export const controllerHandler = async (
  event: AsyncEvent<ControllerWorkItem>,
  _context: HandlerContext
): Promise<void> => {
  // Push initial work item to worker queue here
  // e.g. await workerQueue.push({ eventContext: workItem });

  // Once the initial work item is pushed to the worker queue,
  // keep pushing events to the controller queue with a delay until the work items are all complete
  // e.g. await controllerQueue.push({ eventContext: workItem });

  // Once work items are all complete call the Assets API to signal the completion of data submission

  const _id = await workerQueue.push({
    // for now they are the same shape, so just pass it along
    body: event.body,
  });
}
