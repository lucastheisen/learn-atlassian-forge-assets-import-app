import { Queue } from "@forge/events";
import type { Body } from "@forge/events/out/types";
import type { ReferenceScope } from "./reference-types";

export interface DeleteSourceEvent extends Body {
  scope: ReferenceScope;
}

export interface ReferenceEvent extends Body {
  delayMs?: number;
  queuedAt?: number;
  runKey: string;
}

export const importConcurrency = { key: "import-lifecycle", limit: 1 };

export const referenceQueue = new Queue<ReferenceEvent | DeleteSourceEvent>({
  key: "reference-queue",
});

export const workerQueue = new Queue<ReferenceEvent>({ key: "worker-queue" });

export const queueRun = (key: string, delayInSeconds = 0) =>
  referenceQueue.push({
    body: {
      delayMs: Math.min(900, Math.ceil(delayInSeconds)) * 1000,
      queuedAt: Date.now(),
      runKey: key,
    },
    concurrency: importConcurrency,
    delayInSeconds: Math.min(900, Math.ceil(delayInSeconds)),
  });

export const queueSourceDeletion = (
  scope: ReferenceScope,
  delayInSeconds = 0,
) =>
  referenceQueue.push({
    body: { scope },
    concurrency: importConcurrency,
    delayInSeconds,
  });

export const queueWorker = (key: string) =>
  workerQueue.push({
    body: { delayMs: 0, queuedAt: Date.now(), runKey: key },
    concurrency: importConcurrency,
  });
