"use client"

import { ActivitySection } from "@/components/analytics/activity-section"
import { FilterBar } from "@/components/analytics/filter-bar"
import { ResourceSection } from "@/components/analytics/resource-section"
import { SummaryCards } from "@/components/analytics/summary-cards"
import { SystemStatsSection } from "@/components/analytics/system-stats-section"
import { UserStatsSection } from "@/components/analytics/user-stats-section"
import { useEffect, useState } from "react"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleDateRangeChange = (range: string) => {
    setDateRange(range)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false)
      window.location.reload()
    }, 1000)
  }

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your system performance
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-lg border bg-card"
            />
          ))}
        </div>

        <div className="h-12 animate-pulse rounded-lg border bg-card" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-lg border bg-card" />
          <div className="h-80 animate-pulse rounded-lg border bg-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Monitor your system performance</p>
      </div>

      <SummaryCards />

      <FilterBar
        onDateRangeChange={handleDateRangeChange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="space-y-6">
        <UserStatsSection dateRange={dateRange} />

        <SystemStatsSection />

        <ActivitySection dateRange={dateRange} />

        <ResourceSection />
      </div>
    </div>
  )
}
