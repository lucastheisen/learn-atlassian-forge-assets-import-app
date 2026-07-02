import {
  AppError,
  ArgumentError,
  DataAccessError,
  InvalidOperationError,
} from "../../lib/errors";

export class BadRequestError extends Error {
  constructor(message = "BadRequest", options?: ErrorOptions) {
    super(message, options);
    this.name = "BadRequestError";
  }
}

export class BadRequestValidationError extends Error {
  constructor(message = "BadRequestValidation", options?: ErrorOptions) {
    super(message, options);
    this.name = "BadRequestValidationError";
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

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized", options?: ErrorOptions) {
    super(message, options);
    this.name = "UnauthorizedError";
  }
}

export const toWebTriggerError = (err: unknown): Error => {
  if (err instanceof ArgumentError) {
    return new BadRequestError(err.message, { cause: err });
  }

  if (err instanceof InvalidOperationError) {
    return new BadRequestError(err.message, { cause: err });
  }

  if (err instanceof DataAccessError) {
    return new InternalServerError(err.message, { cause: err });
  }

  if (err instanceof AppError) {
    switch (err.category) {
      case "argument":
        return new BadRequestError(err.message, { cause: err });
      case "invalid-operation":
        return new BadRequestError(err.message, { cause: err });
      case "unexpected":
        return new InternalServerError(err.message, { cause: err });
    }
  }

  return err instanceof Error
    ? err
    : new InternalServerError("unexpected non-error thrown", { cause: err });
};
