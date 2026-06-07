import { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { BadRequestError, StaticWebTriggerResponse } from "./common";
import { KvsDelete, kvsDeleteCommand } from "./kvs-delete";
import { Prune, pruneCommand } from "./prune";
import z from "zod"
import { JWTPayload } from "../../lib/jose";

export { StaticWebTriggerResponse } from "./common";

const commandRegistry: WebTriggerRegistry = {
  "kvs-delete": kvsDeleteCommand,
  "prune": pruneCommand,
};

const WebTriggerActionZod = z.discriminatedUnion(
  "type",
  [
    KvsDelete,
    Prune,
  ]);

type WebTriggerAction = z.infer<typeof WebTriggerActionZod>;

type WebTriggerRegistry = {
  [K in WebTriggerAction["type"]]: (
    action: Extract<WebTriggerAction, { type: K }>,
    claims: JWTPayload,
    event: WebTriggerRequest,
    context: WebTriggerContext
  ) => Promise<StaticWebTriggerResponse>;
};

export const execute = (
  action: WebTriggerAction,
  claims: JWTPayload,
  event: WebTriggerRequest,
  context: WebTriggerContext,
) => {
  return commandRegistry[action.type](action as any, claims, event, context);
}

export const parse = (json: string): WebTriggerAction => {
  try {
    return WebTriggerActionZod.parse(json);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new BadRequestError(`parse failed ${err.message}`, {cause: err})
    }
    throw err
  }
};
