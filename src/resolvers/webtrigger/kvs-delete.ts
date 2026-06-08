import kvs from "@forge/kvs"
import z from "zod"
import { Command, staticWebTriggerResponseSuccess } from "./common";
import { InternalServerError } from "./errors";

export const KvsDelete = z.object({
  type: z.literal("kvs-delete"),
  keys: z.array(z.string()),
});

export const kvsDeleteCommand: Command<z.infer<typeof KvsDelete>> =  async (action) => {
  const deleteItems = action.keys.map((k) => ({key: k}));
  if (deleteItems.length === 0) {
    console.debug("nothing to delete")
    return staticWebTriggerResponseSuccess()
  }

  const res = await kvs.batchDelete(deleteItems);
  console.debug("delete result: ", res);
  if (res.failedKeys.length > 0) {
    throw new InternalServerError(`partial delete failure: ${JSON.stringify(res)}`)
  }

  return staticWebTriggerResponseSuccess();
}
