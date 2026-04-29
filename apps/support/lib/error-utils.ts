import { ZodError } from "zod"

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError
}

export function isErrorWithCode(
  error: unknown,
  code: string
): error is Error & { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string" &&
    (error as { code: string }).code === code
  )
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
