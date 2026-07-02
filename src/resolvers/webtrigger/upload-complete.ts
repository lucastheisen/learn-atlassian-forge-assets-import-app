import z from "zod";
import { writeUploadComplete } from "../../lib/kv-upload";
import { Command, staticWebTriggerResponseSuccess } from "./common";

export const UploadComplete = z.object({
  type: z.literal("upload-complete"),
  uploadId: z.string().min(1),
});

export const uploadCompleteCommand: Command<z.infer<typeof UploadComplete>> = async (action) => {
  await writeUploadComplete(action.uploadId);
  return staticWebTriggerResponseSuccess();
};
