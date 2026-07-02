export type ErrorCategory = "argument" | "invalid-operation" | "unexpected";

export class AppError<TDetails = unknown> extends Error {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly details?: TDetails;

  constructor(
    category: ErrorCategory,
    code: string,
    message: string,
    options?: ErrorOptions & { details?: TDetails },
  ) {
    super(message, options);
    this.name = "AppError";
    this.category = category;
    this.code = code;
    this.details = options?.details;
  }
}

export class ArgumentError<TDetails = unknown> extends AppError<TDetails> {
  constructor(
    code: string,
    message: string,
    options?: ErrorOptions & { details?: TDetails },
  ) {
    super("argument", code, message, options);
    this.name = "ArgumentError";
  }
}

export class InvalidOperationError<TDetails = unknown> extends AppError<TDetails> {
  constructor(
    code: string,
    message: string,
    options?: ErrorOptions & { details?: TDetails },
  ) {
    super("invalid-operation", code, message, options);
    this.name = "InvalidOperationError";
  }
}

export class DataAccessError<TDetails = unknown> extends AppError<TDetails> {
  constructor(
    code: string,
    message: string,
    options?: ErrorOptions & { details?: TDetails },
  ) {
    super("unexpected", code, message, options);
    this.name = "DataAccessError";
  }
}
