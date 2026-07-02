import z from "zod";
import { writeUploadNew } from "../../lib/kv-upload";
import { Command, staticWebTriggerResponseSuccess } from "./common";

export const UploadNew = z.object({
  type: z.literal("upload-new"),
  uploadId: z.string().min(1),
  testing: z.boolean().optional().default(false),
});

export const uploadNewCommand: Command<z.infer<typeof UploadNew>> = async (action) => {
  await writeUploadNew(action.uploadId, action.testing);
  return staticWebTriggerResponseSuccess();
};
