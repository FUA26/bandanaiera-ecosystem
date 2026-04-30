import { Button } from "@workspace/ui/components/button"

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export function DefaultErrorFallback({
  error,
  resetError,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-red-600">Oops!</h1>
        <p className="mb-4 text-gray-600">Something went wrong</p>
        {process.env.NODE_ENV === "development" && (
          <details className="mb-4 text-left text-sm text-gray-500">
            <summary>Error details</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2">
              {error.stack}
            </pre>
          </details>
        )}
        <Button onClick={resetError}>Try again</Button>
      </div>
    </div>
  )
}
