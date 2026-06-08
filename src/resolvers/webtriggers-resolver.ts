import { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { execute, parse, StaticWebTriggerResponse } from "./webtrigger";
import { verifyBearerToken } from "./webtrigger/auth";
import { staticWebTriggerResponseError } from "./webtrigger/common";

type WebTriggerStaticHandler = (
  event: WebTriggerRequest,
  context: WebTriggerContext,
) => Promise<StaticWebTriggerResponse>

export const webtriggerDispatch: WebTriggerStaticHandler = async (event, context) => {
  try {
    const claims = await verifyBearerToken(event.headers);
    return await execute(
      parse(event.body),
      claims,
      event,
      context);
  } catch (err) {
    const response = staticWebTriggerResponseError(err);
    // we need to log all types of errors because none of the details can be
    // exfiltrated so the logs need to be consulted for details even for user
    // errors (like input validation)
    console.warn(response, err instanceof Error ? err.message : err);
    return response;
  }
}
