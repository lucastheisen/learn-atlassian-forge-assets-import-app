import z from "zod";
import { assetsClient, unwrap } from "../../lib/forge-clients";
import { type Command, staticWebTriggerResponseSuccess } from "./common";

export const ImportSmokeCleanup = z.object({
  type: z.literal("import-smoke-cleanup"),
  workspaceId: z.string().min(1),
  objectTypeName: z.string().min(1),
  runId: z.string().min(1),
});

export const importSmokeCleanupCommand: Command<
  z.infer<typeof ImportSmokeCleanup>
> = async (action) => {
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
