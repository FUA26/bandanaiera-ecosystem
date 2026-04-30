"use client"

import { getUserGrowth, getUsersByRole } from "@/lib/analytics/data-fetchers"
import { useQuery } from "@tanstack/react-query"
import { User, Users } from "lucide-react"
import {
  Bar,
  BarChart,
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartWrapper } from "./chart-wrapper"

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "var(--primary)",
  USER: "var(--success)",
  MANAGER: "var(--warning)",
  EDITOR: "var(--secondary)",
}

export function UserStatsSection({ dateRange = "30" }: { dateRange?: string }) {
  const days = parseInt(dateRange) || 30

  const { data: roleData } = useQuery({
    queryKey: ["usersByRole"],
    queryFn: getUsersByRole,
  })

  const { data: growthData } = useQuery({
    queryKey: ["userGrowth", days],
    queryFn: () => getUserGrowth(days),
  })

  // Transform role data for donut chart
  const roleChartData = roleData
    ? Object.entries(roleData).map(([role, count]) => ({
        name: role,
        value: count,
      }))
    : []

  // Transform growth data for stacked bar chart
  const stackedBarData = growthData
    ? Object.entries(growthData).map(([date, roles]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        ...roles,
      }))
    : []

  const totalUsers = roleChartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">User Statistics</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth by Role - Stacked Bar Chart */}
        <ChartWrapper
          title="User Growth by Role"
          icon={Users}
          accentColor="primary"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedBarData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(ROLE_COLORS).map((role) => (
                <Bar
                  key={role}
                  dataKey={role}
                  stackId="1"
                  fill={ROLE_COLORS[role]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* User Distribution - Donut Chart */}
        <ChartWrapper
          title="User Distribution by Role"
          icon={User}
          accentColor="success"
        >
          <div className="flex items-center justify-center">
            <div style={{ position: "relative", width: 300, height: 300 }}>
              <PieChart width={300} height={300}>
                <Pie
                  data={roleChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={70}
                  paddingAngle={2}
                >
                  {roleChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ROLE_COLORS[entry.name] || COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                  <Label
                    value={totalUsers.toString()}
                    position="center"
                    className="fill-foreground text-3xl font-bold"
                  />
                </Pie>
              </PieChart>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {roleChartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: ROLE_COLORS[entry.name] }}
                />
                <span className="text-sm">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </ChartWrapper>
      </div>
    </section>
  )
}

const COLORS = [
  "var(--primary)",
  "var(--success)",
  "var(--warning)",
  "var(--secondary)",
  "var(--error)",
  "var(--muted-foreground)",
]
