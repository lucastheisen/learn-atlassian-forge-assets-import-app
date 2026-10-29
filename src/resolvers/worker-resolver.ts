import type { AsyncEvent } from "@forge/events";
import { advanceRun } from "../lib/import-lifecycle";
import {
  importConcurrency,
  type ReferenceEvent,
} from "../lib/reference-queues";
import { lookupUserByEmail } from "../lib/user-lookup";

export const workerHandler = async (
  event: AsyncEvent<ReferenceEvent>,
): Promise<void> => {
  if (
    event.concurrency?.key !== importConcurrency.key ||
    event.concurrency.limit !== 1
  ) {
    throw new Error("Import concurrency control is required");
  }
  await advanceRun(
    event.body.runKey,
    true,
    lookupUserByEmail,
    undefined,
    event.body,
  );
};
