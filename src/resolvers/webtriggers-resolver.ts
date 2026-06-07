import { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { prune } from "../lib/kv-data";
import { withAuth } from "./webtrigger-auth";
import { StaticWebTriggerResponse } from "./webtrigger";
import { eventLoopUtilization } from "node:perf_hooks";
import kvs from "@forge/kvs";
import { BatchDeleteItem } from "@forge/kvs/out/interfaces/kvs-api";

interface WebTriggerPrune {
  type: "prune"
  keepN: number
}

interface WebTriggerKvsDelete {
  type: "kvs-delete"
  keys: string[]
}

type WebTriggerAction = WebTriggerPrune | WebTriggerKvsDelete

// CODE_REVIEW_CATCH_ME: this doesnt need context or event so probably should be
// remvoed, but for now, nope
export const webtriggerPrune = withAuth(
  async (
    event: WebTriggerRequest,
    _context: WebTriggerContext,
  ): Promise<StaticWebTriggerResponse<
    | "status-ok"
    | "status-error-bad-request"
    | "status-error-internal-server-error"
  >> => {
    try {
      const action: WebTriggerAction = JSON.parse(event.body)
      switch (action.type) {
        case "prune":
          await prune(action.keepN);
          return {outputKey: "status-ok"};
        case "kvs-delete":
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
        default:
          console.debug("unknown type of request: ", event.body);
          return {outputKey: "status-error-bad-request"};
      }
    } catch (err) {
      console.debug("action failed: ", err);
      return {outputKey: "status-error-internal-server-error"};
    }
  });
