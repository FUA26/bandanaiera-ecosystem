import { Button } from "@workspace/ui/components/button"

export interface ErrorPageProps {
  title: string
  description: string
  illustration?: "404" | "500" | "default"
  actions?: Array<
    { label: string; onClick: () => void } | { label: string; href: string }
  >
  error?: Error
}

export function ErrorPage({
  title,
  description,
  illustration = "default",
  actions = [],
  error,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        {illustration === "404" && (
          <div className="mb-4 text-8xl font-bold text-gray-200">404</div>
        )}
        {illustration === "500" && (
          <div className="mb-4 text-8xl font-bold text-red-100">500</div>
        )}

        <h1 className="mb-2 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mb-6 text-gray-600">{description}</p>

        {process.env.NODE_ENV === "development" && error && (
          <details className="mb-6 text-left text-sm text-gray-500">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-gray-100 p-4">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex justify-center gap-3">
          {actions.map((action, index) => {
            if ("onClick" in action) {
              return (
                <Button key={index} onClick={action.onClick}>
                  {action.label}
                </Button>
              )
            }
            return (
              <Button key={index} asChild>
                <a href={action.href}>{action.label}</a>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
