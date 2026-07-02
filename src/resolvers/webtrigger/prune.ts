import z from "zod"
import { prune } from "../../lib/kv-data"
import { Command, staticWebTriggerResponseSuccess } from "./common";

export const Prune = z.object({
  type: z.literal("prune"),
  keepN: z.number().int().nonnegative(),
  testing: z.boolean().optional().default(false),
});

export const pruneCommand: Command<z.infer<typeof Prune>> = async (action) => {
    await prune(action.keepN, action.testing);
    return staticWebTriggerResponseSuccess()
}
