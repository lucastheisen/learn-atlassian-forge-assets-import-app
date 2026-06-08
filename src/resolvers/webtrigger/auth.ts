// inspired by:
//   https://github.com/ibuchanan/explore-forge-jira-custom-api/blob/6fa813cb61c3d2faa6eebe7e4eba24a804b5955b/apps/webtrigger/src/workitem/auth.ts
import { createSecretKey } from "node:crypto";
import { WebTriggerRequest } from "@forge/api";
import { isJOSEError, jwtVerify, type JWTPayload } from "../../lib/jose";
import { InternalServerError, UnauthorizedError } from "./errors";

const CLOCK_SKEW_LEEWAY_SECONDS = 30;
const EXPECTED_AUDIENCE = "write:workitem:custom";
const SECRET_ENV_VAR = "FORGE_WEBTRIGGER_SECRET";

export const verifyBearerToken = async (
  headers:  WebTriggerRequest["headers"] | undefined,
): Promise<JWTPayload> => {
  const secret = process.env[SECRET_ENV_VAR];
  if (!secret) {
    throw new InternalServerError(`${SECRET_ENV_VAR} environment variable is not configured`);
  }
  const secretKey = createSecretKey(secret, "utf-8");

  // headers are lowercase, multi-value
  const authHeader = headers?.authorization?.[0];
  const token = authHeader?.match(/^Bearer\s+(\S+)\s*$/i)?.[1];
  if (token === undefined) {
    throw new UnauthorizedError("missing or malformed Authorization header");
  }

  try {
    // it may be desirable to validate issuer once it is finalized, but for now
    // this verification is secure enough
    return await jwtVerify(
      token,
      secretKey,
      {
        algorithms: ["HS256"],
        audience: EXPECTED_AUDIENCE,
        clockTolerance: CLOCK_SKEW_LEEWAY_SECONDS,
        requiredClaims: ["exp", "iss", "iat"],
      }
    );
  } catch (err) {
    if (await isJOSEError(err)) {
      throw new UnauthorizedError("jwt verify failed", {cause: err});
    }
    throw err;
  }
}
