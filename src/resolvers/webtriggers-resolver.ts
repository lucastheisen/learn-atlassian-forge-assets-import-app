import { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { prune } from "../lib/kv-data";
import { verifyBearerToken, withAuth } from "./webtrigger/auth";
import kvs from "@forge/kvs";
import { execute, parse, StaticWebTriggerResponse } from "./webtrigger";
import { ZodError } from "zod";

type WebTriggerAction = 
  | WebTriggerPrune
  | WebTriggerKvsDelete

interface WebTriggerPrune {
  type: "prune"
  keepN: number
}

interface WebTriggerKvsDelete {
  type: "kvs-delete"
  keys: string[]
}

type WebTriggerStaticHandler = (
  event: WebTriggerRequest,
  context: WebTriggerContext,
) => Promise<StaticWebTriggerResponse>

export const webtriggerDispatch: WebTriggerStaticHandler = async (event, context) => {
  try {
    return await execute(
      parse(event.body),
      await verifyBearerToken(event.headers),
      event,
      context)
  } catch (err) {
    if (err instanceof ZodError) {
      console.debug("action request parse failed: ", err);
      return { outputKey: "status-error-bad-request" };
    }
    console.debug("action failed: ", err);
    return { outputKey: "status-error-internal-server-error" };
  }
}

export const webtriggerPrune = webtriggerDispatch

// CODE_REVIEW_CATCH_ME: this doesnt need context or event so probably should be
// remvoed, but for now, nope
export const webtriggerPruneOld: WebTriggerStaticHandler = withAuth(
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
