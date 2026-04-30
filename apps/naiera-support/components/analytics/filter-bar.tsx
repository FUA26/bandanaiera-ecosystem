"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Calendar, Download, RefreshCw } from "lucide-react"
import { useState } from "react"

interface FilterBarProps {
  onDateRangeChange: (range: string) => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export function FilterBar({
  onDateRangeChange,
  onRefresh,
  isRefreshing = false,
}: FilterBarProps) {
  const [dateRange, setDateRange] = useState("30")

  const handleDateRangeChange = (value: string) => {
    setDateRange(value)
    onDateRangeChange(value)
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1" />

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw
          className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
        Refresh
      </Button>

      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  )
}
