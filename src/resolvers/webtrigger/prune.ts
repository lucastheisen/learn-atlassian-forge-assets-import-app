import z from "zod"
import { Command } from "./common";
import { prune } from "../../lib/kv-data"

export const Prune = z.object({
  type: z.literal("prune"),
  keepN: z.number(),
});

export const pruneCommand: Command<z.infer<typeof Prune>> = async (
  action: ReturnType<typeof Prune["parse"]>,
) => {
    await prune(action.keepN);
    return {outputKey: "status-ok"}
}
