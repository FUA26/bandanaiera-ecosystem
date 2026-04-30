"use client"

/**
 * Dashboard Page Skeleton Component
 *
 * Displays skeleton placeholders while dashboard data is being fetched
 */

import { Skeleton } from "@workspace/ui/components/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
