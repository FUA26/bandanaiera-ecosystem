import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    period?: string
  }
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  const trendIcon =
    trend?.value && trend.value > 0
      ? TrendingUpIcon
      : trend?.value && trend.value < 0
        ? TrendingDownIcon
        : MinusIcon

  const trendColor =
    trend?.value && trend.value > 0
      ? "text-green-600 dark:text-green-500"
      : trend?.value && trend.value < 0
        ? "text-red-600 dark:text-red-500"
        : "text-muted-foreground"

  const TrendIcon = trendIcon

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                trendColor
              )}
            >
              {trend.value !== 0 && <TrendIcon className="size-3" />}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
          {trend?.period && (
            <p className="mt-1 text-xs text-muted-foreground">
              from last {trend.period}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
