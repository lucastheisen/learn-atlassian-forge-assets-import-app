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
