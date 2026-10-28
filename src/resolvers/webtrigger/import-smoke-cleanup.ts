import z from "zod";
import { assetsClient, unwrap } from "../../lib/forge-clients";
import {
  activeRunKey,
  deleteReferenceValues,
  readReferenceValue,
} from "../../lib/kv-reference";
import type { ReferenceRun } from "../../lib/reference-types";
import { type Command, staticWebTriggerResponseSuccess } from "./common";
import { BadRequestError } from "./errors";
import { latestSmokeRun, smokeBaselineKey } from "./import-smoke-reference";

export const ImportSmokeCleanup = z.object({
  type: z.literal("import-smoke-cleanup"),
  workspaceId: z.string().min(1),
  importSourceId: z.string().min(1).optional(),
  objectTypeName: z.string().min(1),
  runId: z.string().min(1),
});

export const importSmokeCleanupCommand: Command<
  z.infer<typeof ImportSmokeCleanup>
> = async (action) => {
  const active = await readReferenceValue<string>(activeRunKey);
  const activeRun = active
    ? await readReferenceValue<ReferenceRun>(active)
    : undefined;
  if (activeRun?.workspaceId === action.workspaceId)
    throw new BadRequestError(
      "An import lifecycle is still active; smoke cleanup must wait",
    );
  if (action.importSourceId) {
    const scope = {
      importSourceId: action.importSourceId,
      testing: true,
      workspaceId: action.workspaceId,
    };
    const run = await latestSmokeRun(scope, action.runId);
    if (run && run.phase !== "complete")
      throw new BadRequestError("This smoke import has not completed");
    await deleteReferenceValues([smokeBaselineKey(scope, action.runId)]);
  }
  const client = assetsClient(action.workspaceId);

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
        qlQuery: `objectType = "${action.objectTypeName}" AND Title = "${action.runId}"`,
      },
    }),
  );

  await Promise.all(
    (result.values ?? []).map((object) =>
      unwrap(
        client.DELETE("/object/{id}", { params: { path: { id: object.id } } }),
      ),
    ),
  );

  return staticWebTriggerResponseSuccess();
};
