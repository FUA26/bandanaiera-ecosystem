/**
 * Dashboard Client Component
 *
 * Displays statistics based on selected app
 */

"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useApp } from "@/lib/contexts/app-context"
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Activity,
  ArrowRight,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/lib/utils"

interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  urgent: number
  high: number
  unassigned: number
  overdue: number
  todayCount: number
  weekCount: number
  monthCount: number
}

interface DashboardClientProps {
  initialUserCount: number
}

export function DashboardClient({ initialUserCount }: DashboardClientProps) {
  const {
    selectedAppId,
    accessibleApps,
    hasAllAccess,
    isLoading: appLoading,
  } = useApp()

  // Fetch ticket stats based on selected app
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["ticket-stats", selectedAppId],
    queryFn: async () => {
      const params = new URLSearchParams()
      // Only add appId if not "all" and not null
      if (selectedAppId && selectedAppId !== "all") {
        params.set("appId", selectedAppId)
      }

      const res = await fetch(`/api/tickets/stats?${params}`)
      if (!res.ok) throw new Error("Failed to fetch stats")
      return res.json() as Promise<TicketStats>
    },
    enabled: !appLoading,
  })

  const isLoading = appLoading || statsLoading

  // Get selected app name
  const selectedAppName =
    selectedAppId === "all"
      ? "All Apps"
      : accessibleApps.find((app) => app.id === selectedAppId)?.name ||
        "Loading..."

  // Stat card component
  function StatCard({
    label,
    value,
    icon: Icon,
    color,
    bgColor,
    trend,
  }: {
    label: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    trend?: string
  }) {
    return (
      <div className="card-interactive p-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-lg",
              bgColor
            )}
          >
            <Icon className={cn("size-5", color)} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
          {trend && (
            <div className="text-xs text-muted-foreground">{trend}</div>
          )}
        </div>
      </div>
    )
  }

  if (appLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Show empty state if user has no app access
  if (!hasAllAccess && accessibleApps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <AlertCircle className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">No App Access</h3>
        <p className="text-muted-foreground">
          You don't have access to any apps. Request access from an
          administrator.
        </p>
      </div>
    )
  }

  const s = stats || {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    high: 0,
    unassigned: 0,
    overdue: 0,
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            {selectedAppName === "All Apps"
              ? "All Applications"
              : selectedAppName}
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => (window.location.href = "/tickets")}
        >
          View All Tickets
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Loading statistics...</div>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Tickets"
              value={s.total}
              icon={MessageSquare}
              color="text-primary"
              bgColor="bg-primary/10"
            />
            <StatCard
              label="Open"
              value={s.open}
              icon={AlertCircle}
              color="text-primary"
              bgColor="bg-primary/10"
            />
            <StatCard
              label="In Progress"
              value={s.inProgress}
              icon={Clock}
              color="text-secondary"
              bgColor="bg-secondary/10"
            />
            <StatCard
              label="Resolved"
              value={s.resolved}
              icon={CheckCircle2}
              color="text-green-600"
              bgColor="bg-green-500/10"
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              label="Urgent"
              value={s.urgent}
              icon={AlertCircle}
              color="text-destructive"
              bgColor="bg-destructive/10"
            />
            <StatCard
              label="High"
              value={s.high}
              icon={TrendingUp}
              color="text-secondary"
              bgColor="bg-secondary/10"
            />
            <StatCard
              label="Unassigned"
              value={s.unassigned}
              icon={Users}
              color="text-muted-foreground"
              bgColor="bg-muted/60"
            />
            <StatCard
              label="Overdue"
              value={s.overdue}
              icon={Clock}
              color="text-destructive"
              bgColor="bg-destructive/10"
            />
            <StatCard
              label="Today"
              value={s.todayCount}
              icon={Activity}
              color="text-primary"
              bgColor="bg-primary/10"
            />
            <StatCard
              label="This Week"
              value={s.weekCount}
              icon={TrendingUp}
              color="text-secondary"
              bgColor="bg-secondary/10"
            />
          </div>

          {/* Activity Summary */}
          <div className="card-interactive p-5">
            <h3 className="mb-4 font-semibold">Activity Summary</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Closed</div>
                  <div className="text-lg font-semibold">{s.closed}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Resolution Rate
                  </div>
                  <div className="text-lg font-semibold">
                    {s.total > 0
                      ? Math.round(((s.resolved + s.closed) / s.total) * 100)
                      : 0}
                    %
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary/10">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    This Month
                  </div>
                  <div className="text-lg font-semibold">{s.monthCount}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
