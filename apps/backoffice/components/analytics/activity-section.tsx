"use client"

import { getRecentActivity } from "@/lib/analytics/data-fetchers"
import { generateMockLoginActivity } from "@/lib/analytics/mock-data"
import { useQuery } from "@tanstack/react-query"
import { Activity, Clock } from "lucide-react"
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartWrapper } from "./chart-wrapper"

export function ActivitySection({ dateRange = "30" }: { dateRange?: string }) {
  const days = parseInt(dateRange) || 30

  const { data: activities } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: getRecentActivity,
  })

  const loginData = generateMockLoginActivity(days)

  const lineChartData = loginData.map((d) => ({
    date: new Date(d.date ?? new Date().toISOString()).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    ),
    successful: d.successful,
    failed: d.failed,
  }))

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "success":
        return "bg-success/10 text-success"
      case "failed":
        return "bg-destructive/10 text-destructive"
      case "pending":
        return "bg-warning/10 text-warning"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Activity Logs</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Login Activity - Line Chart */}
        <ChartWrapper
          title="Login Activity Over Time"
          icon={Activity}
          accentColor="success"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="successful"
                stroke="var(--success)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="failed"
                stroke="var(--destructive)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Recent Activity - Table */}
        <ChartWrapper
          title="Recent Activity"
          icon={Clock}
          accentColor="primary"
        >
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {activities?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-lg bg-muted p-3 transition-colors hover:bg-accent"
              >
                <div className="flex-1">
                  <p className="font-medium">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.details}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(activity.status)}`}
                  >
                    {activity.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartWrapper>
      </div>
    </section>
  )
}
