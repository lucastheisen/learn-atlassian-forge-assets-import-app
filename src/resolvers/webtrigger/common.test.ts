import { describe, expect, it } from "vitest";
import { staticWebTriggerResponseError } from "./common";
import {
  BadRequestError,
  BadRequestValidationError,
  ForbiddenError,
  InternalServerError,
  UnauthorizedError,
} from "./errors";

describe("staticWebTriggerResponseError", () => {
  it.each([
    [new BadRequestValidationError(), "status-error-bad-request-validate"],
    [new BadRequestError(), "status-error-bad-request"],
    [new UnauthorizedError(), "status-error-unauthorized"],
    [new ForbiddenError(), "status-error-forbidden"],
    [new InternalServerError(), "status-error-internal-server-error"],
    [new Error("unknown"), "status-error-internal-server-error"],
    ["not-an-error", "status-error-internal-server-error"],
  ])("maps %p to %s", (err, outputKey) => {
    expect(staticWebTriggerResponseError(err)).toEqual({ outputKey });
  });
});
