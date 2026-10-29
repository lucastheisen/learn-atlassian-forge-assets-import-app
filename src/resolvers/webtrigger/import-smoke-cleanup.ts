import { route } from "@forge/api";
import z from "zod";
import {
  activeRunKey,
  deleteReferenceValues,
  readReferenceValue,
} from "../../lib/kv-reference";
import { referenceRequest } from "../../lib/reference-api";
import {
  ContinueLater,
  ProcessingBudget,
  ProductRequestError,
  type ReferenceRun,
} from "../../lib/reference-types";
import { type Command, staticWebTriggerResponseSuccess } from "./common";
import { latestSmokeRun, smokeBaselineKey } from "./import-smoke-reference";
import { smokePending } from "./import-smoke-response";

export const ImportSmokeCleanup = z.object({
  importSourceId: z.string().min(1).optional(),
  objectTypeName: z.string().min(1),
  runId: z.string().min(1),
  type: z.literal("import-smoke-cleanup"),
  workspaceId: z.string().min(1),
});

export const importSmokeCleanupCommand: Command<
  z.infer<typeof ImportSmokeCleanup>
> = async (action) => {
  const budget = new ProcessingBudget(Date.now, 30_000);
  const active = await readReferenceValue<string>(activeRunKey);
  const activeRun = active
    ? await readReferenceValue<ReferenceRun>(active)
    : undefined;
  if (activeRun?.workspaceId === action.workspaceId)
    return smokePending(
      activeRun.phase === "complete" ? "finalizing" : activeRun.phase,
    );
  if (action.importSourceId) {
    const scope = {
      importSourceId: action.importSourceId,
      testing: true,
      workspaceId: action.workspaceId,
    };
    const run = await latestSmokeRun(scope, action.runId);
    if (run && run.phase !== "complete") return smokePending(run.phase);
  }
  try {
    const result = await referenceRequest<{ values: { id: string }[] }>(
      route`/jsm/assets/workspace/${action.workspaceId}/v1/object/aql?includeAttributes=${"false"}&maxResults=${20}`,
      budget,
      {
        body: JSON.stringify({
          qlQuery: `objectType = ${JSON.stringify(action.objectTypeName)} AND Title = ${JSON.stringify(action.runId)}`,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    const objects = result.values;
    for (let offset = 0; offset < objects.length; offset += 4) {
      budget.check();
      const deleted = await Promise.allSettled(
        objects
          .slice(offset, offset + 4)
          .map((object) =>
            referenceRequest(
              route`/jsm/assets/workspace/${action.workspaceId}/v1/object/${object.id}`,
              budget,
              { method: "DELETE" },
            ),
          ),
      );
      const failed = deleted.find(
        (item) =>
          item.status === "rejected" &&
          !(
            item.reason instanceof ProductRequestError &&
            item.reason.status === 404
          ),
      );
      if (failed?.status === "rejected") throw failed.reason;
    }
    if (objects.length) return smokePending("objects");
    if (action.importSourceId)
      await deleteReferenceValues([
        smokeBaselineKey(
          {
            importSourceId: action.importSourceId,
            testing: true,
            workspaceId: action.workspaceId,
          },
          action.runId,
        ),
      ]);
    return staticWebTriggerResponseSuccess();
  } catch (error) {
    if (error instanceof ContinueLater) return smokePending("objects");
    throw error;
  }
};
