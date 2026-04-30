import type { ReactNode } from "react"

interface AuthPageShellProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  badge?: string
}

export function AuthPageShell({
  title,
  description,
  children,
  footer,
  badge = "Panel Operasional",
}: AuthPageShellProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <span className="inline-flex items-center rounded-full border border-border/70 bg-background px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          {badge}
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
            {title}
          </h1>
          <p className="max-w-[34ch] text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div>{children}</div>

      {footer ? <div className="pt-1">{footer}</div> : null}
    </section>
  )
}
