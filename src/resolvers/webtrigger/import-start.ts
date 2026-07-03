import z from "zod";
import { getLatestManifest, getLatestTestManifest } from "../../lib/kv-data";
import { beginImport } from "../index";
import { type Command, staticWebTriggerResponseSuccess } from "./common";
import { BadRequestError } from "./errors";

export const ImportStart = z.object({
  type: z.literal("import-start"),
  workspaceId: z.string().min(1),
  importSourceId: z.string().min(1),
  testing: z.boolean().optional().default(false),
});

export const importStartCommand: Command<z.infer<typeof ImportStart>> = async (
  action,
) => {
  const manifest = action.testing
    ? await getLatestTestManifest()
    : await getLatestManifest();
  if (manifest === undefined) {
    throw new BadRequestError(
      `no completed${action.testing ? " test" : ""} upload manifest found`,
    );
  }

  await beginImport({
    workspaceId: action.workspaceId,
    importSourceId: action.importSourceId,
    manifest,
  });

  return staticWebTriggerResponseSuccess();
};
