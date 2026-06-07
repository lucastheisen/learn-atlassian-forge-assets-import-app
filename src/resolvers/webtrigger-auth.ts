// inspired by:
//   https://github.com/ibuchanan/explore-forge-jira-custom-api/blob/6fa813cb61c3d2faa6eebe7e4eba24a804b5955b/apps/webtrigger/src/workitem/auth.ts
import { createSecretKey } from "node:crypto";
import { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { isJOSEError, jwtVerify, type JWTPayload } from "../lib/jose";
import type { StaticWebTriggerResponse } from "./webtrigger";

const CLOCK_SKEW_LEEWAY_SECONDS = 30;
const EXPECTED_AUDIENCE = "write:workitem:custom";
const SECRET_ENV_VAR = "FORGE_WEBTRIGGER_SECRET";

type AuthzHandler = (claims: JWTPayload) => Promise<boolean>;

type AuthedHandler<R extends StaticWebTriggerResponse> = (
  event: WebTriggerRequest,
  context: WebTriggerContext
) => Promise<R>;

type WebTriggerAuthFailureResponse = StaticWebTriggerResponse<
  | "status-error-bad-request"
  | "status-error-forbidden"
  | "status-error-unauthorized"
  | "status-error-internal-server-error">

type WebTriggerWithAuthResponse<R extends StaticWebTriggerResponse> =
  | R
  | WebTriggerAuthFailureResponse;

class BadRequestError extends Error {
  constructor(message = "BadReqeustError") {
    super(message);
    this.name = "BadReqeustError";
  }
}

class InternalServerError extends Error {
  constructor(message = "InternalServerError") {
    super(message);
    this.name = "InternalServerError";
  }
}

class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

const verifyBearerToken = async (
  headers:  WebTriggerRequest["headers"] | undefined,
): Promise<JWTPayload> => {
  const secret = process.env[SECRET_ENV_VAR];
  if (!secret) {
    throw new InternalServerError(`${SECRET_ENV_VAR} environment variable is not configured`);
  }
  const secretKey = createSecretKey(secret, "utf-8");

  // headers are lowercase, multi-value
  const authHeader = headers?.authorization?.[0];
  const BEARER_PREFIX = "Bearer ";
  if (!authHeader?.startsWith(BEARER_PREFIX)) {
    throw new UnauthorizedError("missing or malformed Authorization header");
  }
  const token = authHeader.slice(BEARER_PREFIX.length);

  return jwtVerify(
    token,
    secretKey,
    {
      algorithms: ["HS256"],
      audience: EXPECTED_AUDIENCE,
      clockTolerance: CLOCK_SKEW_LEEWAY_SECONDS,
      requiredClaims: ["iss", "iat"],
    }
  );
}

export function withAuth<R extends StaticWebTriggerResponse>(
  handler: AuthedHandler<R>,
  authzHandler?: AuthzHandler,
) {
  return async (
    event: WebTriggerRequest,
    context: WebTriggerContext,
  ): Promise<WebTriggerWithAuthResponse<R>> => {
    try {
      const claims = await verifyBearerToken(event.headers);
      if (authzHandler !== undefined && !(await authzHandler(claims))) {
        return {outputKey: "status-error-forbidden"};
      }
      return await handler(event, context);
    } catch (err) {
      if (err instanceof BadRequestError) {
        console.log('forbidden: ', err.message);
        return {outputKey: "status-error-bad-request"};
      } else if ((err instanceof Error && await isJOSEError(err)) || err instanceof UnauthorizedError) {
        console.log('unauthorized: ', err.message);
        return {outputKey: "status-error-unauthorized"};
      } else if (err instanceof ForbiddenError) {
        console.log('forbidden: ', err.message);
        return {outputKey: "status-error-forbidden"};
      } else if (err instanceof InternalServerError) {
        console.log('internal server error: ', err.message);
        return {outputKey: "status-error-internal-server-error"};
      }

      console.log('unknown failure: ', err)
      return {outputKey: "status-error-internal-server-error"};
    }
  };
}
