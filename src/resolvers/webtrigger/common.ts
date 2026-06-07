import { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { JWTPayload } from "../../lib/jose";

export class BadRequestError extends Error {
  constructor(message = "BadReqeustError", options?: ErrorOptions) {
    super(message, options);
    this.name = "BadReqeustError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden", options?: ErrorOptions) {
    super(message, options);
    this.name = "ForbiddenError";
  }
}

export class InternalServerError extends Error {
  constructor(message = "InternalServerError", options?: ErrorOptions) {
    super(message, options);
    this.name = "InternalServerError";
  }
}

export type StaticWebTriggerResponse<K extends string = string> = {
  outputKey: K
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized", options?: ErrorOptions) {
    super(message, options);
    this.name = "UnauthorizedError";
  }
}

export type Command<T> = (
  action: T, 
  claims: JWTPayload,
  event: WebTriggerRequest, 
  context: WebTriggerContext
) => Promise<StaticWebTriggerResponse>;
