import z from "zod";
import { writeUploadData } from "../../lib/kv-upload";
import { Command, staticWebTriggerResponseSuccess } from "./common";

export const UploadData = z.object({
  type: z.literal("upload-data"),
  uploadId: z.string().min(1),
  index: z.number().int().nonnegative(),
  data: z.record(z.unknown()),
});

export const uploadDataCommand: Command<z.infer<typeof UploadData>> = async (action) => {
  await writeUploadData(action.uploadId, action.index, action.data);
  return staticWebTriggerResponseSuccess();
};
