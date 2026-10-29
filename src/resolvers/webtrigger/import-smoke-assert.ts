import z from "zod";
import { assetsClient, unwrap } from "../../lib/forge-clients";
import { executionStatus } from "../../lib/reference-assets";
import { NativeStatusSchema } from "../../lib/reference-schemas";
import { ProcessingBudget } from "../../lib/reference-types";
import { type Command, staticWebTriggerResponseSuccess } from "./common";
import { BadRequestError } from "./errors";
import {
  assertSmokeReferences,
  latestSmokeRun,
  SmokeReferenceCheck,
} from "./import-smoke-reference";
import { smokeFailed, smokePending } from "./import-smoke-response";

export const ImportSmokeAssert = z.object({
  expectedStatus: NativeStatusSchema,
  importSourceId: z.string().min(1),
  objects: z
    .object({
      expectedCount: z.number().int().nonnegative(),
      objectTypeName: z.string().min(1),
      runId: z.string().min(1),
    })
    .optional(),
  referenceSync: SmokeReferenceCheck.optional(),
  type: z.literal("import-smoke-assert"),
  uploadId: z.string().min(1).optional(),
  workspaceId: z.string().min(1),
});

export const importSmokeAssertCommand: Command<
  z.infer<typeof ImportSmokeAssert>
> = async (action) => {
  const client = assetsClient(action.workspaceId);

  const uploadId =
    action.uploadId ?? action.referenceSync?.uploadId ?? action.objects?.runId;
  const scope = {
    importSourceId: action.importSourceId,
    testing: true,
    workspaceId: action.workspaceId,
  };
  const run = uploadId ? await latestSmokeRun(scope, uploadId) : undefined;
  if (uploadId && !run) return smokePending("queued");
  if (run?.failure) return smokeFailed();
  if (run && !run.executionId)
    return smokePending(run.phase === "complete" ? "queued" : run.phase);
  const status = run
    ? await executionStatus(run, new ProcessingBudget(Date.now, 45_000))
    : await unwrap(
        client.GET("/importsource/{importSourceId}/executions/status", {
          params: { path: { importSourceId: action.importSourceId } },
        }),
      );
  if (status.status !== action.expectedStatus) {
    if (["DONE", "CANCELLED"].includes(status.status)) return smokeFailed();
    return smokePending(
      run && run.phase !== "complete" ? run.phase : "polling",
    );
  }

  if (action.objects !== undefined) {
    const { objectTypeName, runId, expectedCount } = action.objects;
    const result = await unwrap(
      client.POST("/object/aql/totalcount", {
        body: {
          qlQuery: `objectType = ${JSON.stringify(objectTypeName)} AND Title = ${JSON.stringify(runId)}`,
        },
        headers: {
          Accept: "application/json",
        },
      }),
    );

    const found = result.totalCount;
    if (found === undefined)
      throw new BadRequestError("Smoke object count is missing");
    if (found !== expectedCount) {
      console.log(
        `SMOKE_OBJECTS ${JSON.stringify({ expectedCount, found, runId })}`,
      );
      return smokePending("objects");
    }
  }

  if (action.referenceSync) {
    if (run && run.phase !== "complete") return smokePending(run.phase);
    try {
      await assertSmokeReferences(
        scope,
        run?.executionId ??
          ("executionId" in status ? String(status.executionId) : ""),
        action.referenceSync,
      );
    } catch (error) {
      if (!(error instanceof BadRequestError)) throw error;
      console.warn(
        "SMOKE_CHECK_FAILED " +
          JSON.stringify({ check: "references", runId: run?.id, uploadId }),
      );
      return smokeFailed();
    }
  }

  return staticWebTriggerResponseSuccess();
};
