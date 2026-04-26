import { Queue } from '@forge/events';
import { workerQueue } from './worker-resolver';

export const controllerQueue = new Queue({ key: 'controller-queue' });

export async function controllerHandler(_event, _context) {
  // Push initial work item to worker queue here
  // e.g. await workerQueue.push({ eventContext: workItem });

  // Once the initial work item is pushed to the worker queue,
  // keep pushing events to the controller queue with a delay until the work items are all complete
  // e.g. await controllerQueue.push({ eventContext: workItem });

  // Once work items are all complete call the Assets API to signal the completion of data submission

  const _id = await workerQueue.push({ body: { eventContext: { workId: 'your-work-id' } } });
}
