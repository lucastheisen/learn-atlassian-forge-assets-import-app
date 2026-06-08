import { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { JWTPayload } from "../../lib/jose";
import {
  BadRequestError,
  BadRequestValidationError,
  ForbiddenError,
  InternalServerError,
  UnauthorizedError,
} from "./errors";

export type Command<T> = (
  action: T,
  claims: JWTPayload,
  event: WebTriggerRequest,
  context: WebTriggerContext
) => Promise<StaticWebTriggerResponse>;

export type StaticWebTriggerResponse =
  | ReturnType<typeof staticWebTriggerResponseSuccess>
  | ReturnType<typeof staticWebTriggerResponseError>

export const staticWebTriggerResponseSuccess = () => {
  return {
    outputKey: "status-ok",
  } as const
}

export const staticWebTriggerResponseError = (err: unknown) => {
  if (err instanceof BadRequestValidationError) {
    return { outputKey: "status-error-bad-request-validate" } as const
  }

  if (err instanceof BadRequestError) {
    return { outputKey: "status-error-bad-request" } as const
  }

  if (err instanceof UnauthorizedError) {
    return { outputKey: "status-error-unauthorized" } as const
  }

  if (err instanceof ForbiddenError) {
    return { outputKey: "status-error-forbidden" } as const
  }

  if (err instanceof InternalServerError) {
    return { outputKey: "status-error-internal-server-error" } as const
  }

  return { outputKey: "status-error-internal-server-error" } as const
}
