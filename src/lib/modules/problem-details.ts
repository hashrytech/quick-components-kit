/**
 * Custom error class representing a structured Problem Details error response.
 * 
 * This class conforms to the RFC 7807 Problem Details format with an additional `errors`
 * field for validation-specific field errors. It is suitable for use in APIs and form
 * validation where you want to return field-specific messages along with standard
 * HTTP error information.
 */
export class ProblemDetailError extends Error {
  /** HTTP status code (e.g. 400, 404, 500) */
  status: number;

  /** A URI reference that identifies the problem type (e.g. "/exceptions/invalid_input/") */
  type: string;

  /** A human-readable explanation specific to this occurrence of the problem */
  detail: string;

  /**
   * A dictionary of field-specific validation errors.
   * Example: { email: ["Invalid email address"] }
   */
  errors: Record<string, string[]>;

  /**
   * Constructs a new ProblemDetailError instance.
   *
   * @param field - The field name that has a validation error.
   * @param field_error - The error message associated with the field.
   * @param status - HTTP status code (default: 400).
   * @param title - A short, human-readable summary of the problem (default: "Bad Request").
   * @param type - A URI identifier for the problem type (default: "/exceptions/bad_request/").
   */
  constructor(field: string, field_error: string, status = 400, title = "Bad Request", type = "/exceptions/bad_request/") {
    super(title); // Call parent Error class constructor
    this.name = "ProblemDetailError";
    this.status = status;
    this.type = type;
    this.detail = "Your request contained invalid input.";
    this.errors = {
      [field]: [field_error]
    };
  }

  /**
   * Converts the ProblemDetailError instance into a plain dictionary object,
   * suitable for serializing to JSON in HTTP responses (e.g., conforming to RFC 7807).
   *
   * @returns A plain object containing the structured error details.
   */
  toDict(): Record<string, string | string[] | number | Record<string, string[]>> {
    return {
      // The HTTP status code associated with the error (e.g., 400, 404)
      status: this.status,

      // A short, human-readable summary of the problem
      title: this.message,

      // A URI identifier for the type of error
      type: this.type,

      // A detailed human-readable explanation of the error
      detail: this.detail,

      // Field-specific validation errors (uncomment if needed)
      errors: this.errors
    };
  }
}

export interface ProblemDetail {
  status: number;
  title: string;
  detail: string;
  type: string;  
  error?: Record<string, string | string[] | number | boolean>;
  [key: string]: unknown | unknown[];
}


/**
 * Constructs a structured problem detail object (RFC 7807-style),
 * with support for arbitrary key-value pairs (e.g., field-level error messages).
 *
 * @param input - An object with optional status, title, detail, and type,
 *                plus any additional field-specific errors as key-value strings.
 *
 * @returns A `ProblemDetail` object suitable for use in APIs.
 */
export function getProblemDetail(input: { status?: number; title?: string; detail?: string; type?: string; [key: string]: string | number | undefined;}): ProblemDetail {
  const { status = 400, title = "Bad Request", detail = "Your request contained invalid input.",  type = "/exceptions/bad-request/",  ...extraFields } = input;

  const problem: ProblemDetail = { status, title, detail, type };

  // Attach arbitrary string fields (e.g., email, password)
  for (const [key, value] of Object.entries(extraFields)) {
    if (typeof value === 'string' || typeof value === 'number') {
      problem[key] = [value];
    }
  }

  return problem;
}
