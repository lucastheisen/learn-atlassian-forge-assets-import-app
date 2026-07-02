import { kvs } from "@forge/kvs";
import z from "zod";
import { deleteAllValues, getAllValues } from "../../lib/kv-common";
import { Command, staticWebTriggerResponseSuccess } from "./common";
import { InternalServerError } from "./errors";

export const UploadAbort = z.object({
  type: z.literal("upload-abort"),
  uploadId: z.string().min(1),
});

interface UploadDataManifest {
  key: string;
}

const uploadManifestKey = (uploadId: string) => `import:upload:${uploadId}:manifest`;

const uploadDataManifestKeyPrefix = (uploadId: string) => `import:upload:${uploadId}:data:`;

export const uploadAbortCommand: Command<z.infer<typeof UploadAbort>> = async (action) => {
  const uploadData = await getAllValues<UploadDataManifest>(
    uploadDataManifestKeyPrefix(action.uploadId),
  );

  const keys = uploadData.flatMap(({ key, value }) => [key, value.key]);

  const manifestKey = uploadManifestKey(action.uploadId);
  const manifest = await kvs.get(manifestKey);
  if (manifest !== undefined) {
    keys.push(manifestKey);
  }

  const uniqueKeys = [...new Set(keys)];
  if (uniqueKeys.length === 0) {
    console.debug(`upload-abort(${action.uploadId}): nothing to delete`);
    return staticWebTriggerResponseSuccess();
  }

  const result = await deleteAllValues(uniqueKeys);
  if (result.failedKeys.length > 0) {
    throw new InternalServerError(`partial upload-abort failure: ${JSON.stringify(result)}`);
  }

  return staticWebTriggerResponseSuccess();
};
