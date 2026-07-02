import { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import z from "zod";
import { JWTPayload } from "../../lib/jose";
import { StaticWebTriggerResponse } from "./common";
import { BadRequestError, BadRequestValidationError } from "./errors";
import { KvsDelete, kvsDeleteCommand } from "./kvs-delete";
import { Prune, pruneCommand } from "./prune";
import {
  UploadSmokeAssertLatest,
  uploadSmokeAssertLatestCommand,
} from "./upload-smoke-assert-latest";
import { UploadAbort, uploadAbortCommand } from "./upload-abort";
import { UploadComplete, uploadCompleteCommand } from "./upload-complete";
import { UploadData, uploadDataCommand } from "./upload-data";
import { UploadNew, uploadNewCommand } from "./upload-new";

export { StaticWebTriggerResponse } from "./common";

const commandRegistry: WebTriggerRegistry = {
  "kvs-delete": kvsDeleteCommand,
  "prune": pruneCommand,
  "upload-abort": uploadAbortCommand,
  "upload-complete": uploadCompleteCommand,
  "upload-data": uploadDataCommand,
  "upload-new": uploadNewCommand,
  "upload-smoke-assert-latest": uploadSmokeAssertLatestCommand,
};

const WebTriggerActionZod = z.discriminatedUnion("type", [
  KvsDelete,
  Prune,
  UploadAbort,
  UploadComplete,
  UploadData,
  UploadNew,
  UploadSmokeAssertLatest,
]);

type WebTriggerAction = z.infer<typeof WebTriggerActionZod>;

type WebTriggerRegistry = {
  [K in WebTriggerAction["type"]]: (
    action: Extract<WebTriggerAction, { type: K }>,
    claims: JWTPayload,
    event: WebTriggerRequest,
    context: WebTriggerContext,
  ) => Promise<StaticWebTriggerResponse>;
};

export const execute = (
  action: WebTriggerAction,
  claims: JWTPayload,
  event: WebTriggerRequest,
  context: WebTriggerContext,
) => {
  // Localized escape hatch: TypeScript cannot prove that the handler selected
  // by `action.type` accepts this exact `action` subtype through indexed
  // registry dispatch. This is safe as long as `action` has been validated by
  // `WebTriggerActionZod` and `commandRegistry` remains keyed by the same
  // discriminant values.
  return commandRegistry[action.type](action as any, claims, event, context);
};

export const parse = (json: string | undefined): WebTriggerAction => {
  if (json === undefined) {
    throw new BadRequestError("missing request body");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    throw new BadRequestError("malformed JSON body", { cause: err });
  }

  try {
    return WebTriggerActionZod.parse(parsed);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new BadRequestValidationError(`parse failed ${err.message}`, { cause: err });
    }
    throw err;
  }
};
