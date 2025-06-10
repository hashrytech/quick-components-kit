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
}
