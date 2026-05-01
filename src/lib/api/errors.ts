import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export function createApiErrorResponse(
  code: ApiErrorCode,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        fieldErrors,
      },
    },
    { status },
  );
}

export function createValidationErrorResponse(error: ZodError) {
  const fieldErrors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => entry[1] !== undefined,
    ),
  );

  return createApiErrorResponse(
    "VALIDATION_ERROR",
    "The request payload is invalid.",
    400,
    fieldErrors,
  );
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
