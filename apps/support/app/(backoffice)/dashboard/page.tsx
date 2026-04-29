import { StatCard } from "@/features/dashboard/components/stat-card"
import { ActivityChart } from "@/features/dashboard/components/activity-chart"
import { RecentActivity } from "@/features/dashboard/components/recent-activity"
import {
  UsersIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  PackageIcon,
} from "lucide-react"

export default function BackofficeDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening in your admin panel
          today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="2,543"
          icon={UsersIcon}
          trend={{ value: 12, period: "month" }}
        />
        <StatCard
          title="Total Orders"
          value="1,234"
          icon={ShoppingCartIcon}
          trend={{ value: 8, period: "month" }}
        />
        <StatCard
          title="Revenue"
          value="$45,678"
          icon={DollarSignIcon}
          trend={{ value: 23, period: "month" }}
        />
        <StatCard
          title="Active Products"
          value="156"
          icon={PackageIcon}
          trend={{ value: 5, period: "month" }}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ActivityChart />
        <RecentActivity />
      </div>
    </div>
  )
}
