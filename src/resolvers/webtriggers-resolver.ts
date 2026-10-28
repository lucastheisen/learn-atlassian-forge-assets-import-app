import type { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { AppError } from "../lib/errors";
import { execute, parse, type StaticWebTriggerResponse } from "./webtrigger";
import { verifyBearerToken } from "./webtrigger/auth";
import { staticWebTriggerResponseError } from "./webtrigger/common";
import { toWebTriggerError } from "./webtrigger/errors";

type WebTriggerStaticHandler = (
  event: WebTriggerRequest,
  context: WebTriggerContext,
) => Promise<StaticWebTriggerResponse>;

export const webtriggerDispatch: WebTriggerStaticHandler = async (
  event,
  context,
) => {
  try {
    const claims = await verifyBearerToken(event.headers);
    return await execute(parse(event.body), claims, event, context);
  } catch (err) {
    const mappedErr = toWebTriggerError(err);
    const response = staticWebTriggerResponseError(mappedErr);

    console.warn("Webtrigger command failed", {
      code: err instanceof AppError ? err.code : mappedErr.name,
      outputKey: response.outputKey,
    });

    return response;
  }
};
