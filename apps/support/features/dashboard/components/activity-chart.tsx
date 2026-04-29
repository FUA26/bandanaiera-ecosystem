"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type TimePeriod = "7d" | "30d" | "90d"

const chartData = {
  "7d": [
    { day: "Mon", value: 12 },
    { day: "Tue", value: 19 },
    { day: "Wed", value: 15 },
    { day: "Thu", value: 25 },
    { day: "Fri", value: 32 },
    { day: "Sat", value: 18 },
    { day: "Sun", value: 14 },
  ],
  "30d": [
    { day: "Week 1", value: 85 },
    { day: "Week 2", value: 102 },
    { day: "Week 3", value: 98 },
    { day: "Week 4", value: 124 },
  ],
  "90d": [
    { day: "Month 1", value: 320 },
    { day: "Month 2", value: 412 },
    { day: "Month 3", value: 489 },
  ],
}

export function ActivityChart() {
  const [period, setPeriod] = React.useState<TimePeriod>("7d")
  const data = chartData[period]
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Daily activity metrics over time</CardDescription>
          </div>
          <div className="flex gap-1">
            {(["7d", "30d", "90d"] as TimePeriod[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
                className="h-8"
              >
                {p === "7d" ? "7 days" : p === "30d" ? "30 days" : "90 days"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = (item.value / maxValue) * 100
            return (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="relative w-full">
                  <div
                    className={cn(
                      "mx-auto w-full max-w-[60px] rounded-t-lg bg-primary transition-all duration-500",
                      "hover:opacity-80"
                    )}
                    style={{ height: `${height}%`, minHeight: "4px" }}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium tabular-nums opacity-0 transition-opacity hover:opacity-100">
                    {item.value}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.day}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
