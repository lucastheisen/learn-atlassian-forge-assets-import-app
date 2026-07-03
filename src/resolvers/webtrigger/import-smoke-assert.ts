import z from "zod";
import { assetsClient, unwrap } from "../../lib/forge-clients";
import { type Command, staticWebTriggerResponseSuccess } from "./common";
import { BadRequestError } from "./errors";

export const ImportSmokeAssert = z.object({
  type: z.literal("import-smoke-assert"),
  workspaceId: z.string().min(1),
  importSourceId: z.string().min(1),
  expectedStatus: z.enum(["INGESTING", "PROCESSING", "DONE", "CANCELLED"]),
  objects: z
    .object({
      objectTypeName: z.string().min(1),
      runId: z.string().min(1),
      expectedCount: z.number().int().nonnegative(),
    })
    .optional(),
});

export const importSmokeAssertCommand: Command<
  z.infer<typeof ImportSmokeAssert>
> = async (action) => {
  const client = assetsClient(action.workspaceId);

  const status = await unwrap(
    client.GET("/importsource/{importSourceId}/executions/status", {
      headers: {
        Accept: "application/json",
      },
      params: {
        path: {
          importSourceId: action.importSourceId,
        },
      },
    }),
  );

  if (status.status !== action.expectedStatus) {
    throw new BadRequestError(
      `expected execution status ${action.expectedStatus} but found ${status.status}`,
    );
  }

  if (action.objects !== undefined) {
    const { objectTypeName, runId, expectedCount } = action.objects;
    const result = await unwrap(
      client.POST("/object/aql", {
        headers: {
          Accept: "application/json",
        },
        params: {
          query: {
            includeAttributes: false,
            maxResults: 100,
          },
        },
        body: {
          qlQuery: `objectType = "${objectTypeName}" AND Title = "${runId}"`,
        },
      }),
    );

    const found = result.values?.length ?? 0;
    if (found !== expectedCount) {
      throw new BadRequestError(
        `expected ${expectedCount} "${objectTypeName}" objects for run ${runId} but found ${found}`,
      );
    }
  }

  return staticWebTriggerResponseSuccess();
};
