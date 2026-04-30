import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface ChartWrapperProps {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
  accentColor?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "muted"
}

const accentColors = {
  primary: "border-l-primary",
  secondary: "border-l-secondary",
  success: "border-l-success",
  warning: "border-l-warning",
  destructive: "border-l-destructive",
  muted: "border-l-muted-foreground",
}

const iconColors = {
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
}

export function ChartWrapper({
  title,
  icon: Icon,
  children,
  className,
  accentColor = "primary",
}: ChartWrapperProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-l-4 bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        accentColors[accentColor],
        className
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <Icon className={cn("h-5 w-5", iconColors[accentColor])} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}
