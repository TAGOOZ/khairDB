export class IndividualError extends Error {
  code: string;
  originalError?: any;

  constructor(code: string, message: string, originalError?: any) {
    super(message);
    this.name = 'IndividualError';
    this.code = code;
    this.originalError = originalError;

    // Maintain proper stack trace (only for V8 environments like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}


export class FamilyError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'FamilyError';
  }
}

export class NeedError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'NeedError';
  }
}

export class DistributionError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DistributionError';
  }
}

export class PendingRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PendingRequestError';
  }
}
