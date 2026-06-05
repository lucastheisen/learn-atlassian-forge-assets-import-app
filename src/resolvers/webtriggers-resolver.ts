import { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { prune } from "../lib/kv-data";
import { withAuth } from "./webtrigger-auth";
import { WebTriggerResponse } from "./webtrigger";

// CODE_REVIEW_CATCH_ME: this doesnt need context or event so probably should be
// remvoed, but for now, nope
export const webtriggerPrune = withAuth(async (
  _event: WebTriggerRequest,
  _context: WebTriggerContext,
): Promise<WebTriggerResponse<"status-ok" | "bad-request">> => {
  //await prune(0);
  if (false) {
    return {outputKey: "bad-request"}
  }
  return {outputKey: "status-ok"}
});
