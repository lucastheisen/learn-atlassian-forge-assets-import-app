import kvs from "@forge/kvs"
import z from "zod"
import { Command } from "./common";

export const KvsDelete = z.object({
  type: z.literal("kvs-delete"),
  keys: z.array(z.string()),
});

export const kvsDeleteCommand: Command<z.Infer<typeof KvsDelete>> =  async(
  action: ReturnType<typeof KvsDelete["parse"]>,
) => {
  const deleteItems = action.keys.map((k) => ({key: k}));
  if (deleteItems.length === 0) {
    console.debug("nothing to delete")
    return {outputKey: "status-ok"};
  }

  const res = await kvs.batchDelete(deleteItems);
  console.debug("delete result: ", res);
  return (res.failedKeys.length > 0)
    ? {outputKey: "status-error-internal-server-error"}
    : {outputKey: "status-ok"};
}
