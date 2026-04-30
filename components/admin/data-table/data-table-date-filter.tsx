"use client"

import { Column } from "@tanstack/react-table"
import { format, isSameDay } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import * as React from "react"
import { DateRange } from "react-day-picker"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@/lib/utils"

interface DateFilterValue {
  from?: Date
  to?: Date
}

type DateFilterMode = "single" | "range"

interface DataTableDateFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  mode?: DateFilterMode
}

export function DataTableDateFilter<TData, TValue>({
  column,
  title = "Date",
  mode = "range",
}: DataTableDateFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [singleDate, setSingleDate] = React.useState<Date | undefined>()
  const filterValue = column?.getFilterValue() as DateFilterValue | undefined
  const filterValueKey = `${filterValue?.from ? new Date(filterValue.from).getTime() : ""}:${filterValue?.to ? new Date(filterValue.to).getTime() : ""}`

  // Sync with column filter value from URL
  React.useEffect(() => {
    const currentFilterValue = column?.getFilterValue() as
      | DateFilterValue
      | undefined

    if (currentFilterValue) {
      const from = currentFilterValue.from
        ? new Date(currentFilterValue.from)
        : undefined
      const to = currentFilterValue.to
        ? new Date(currentFilterValue.to)
        : undefined

      if (mode === "single") {
        setSingleDate(from)
        setDateRange(undefined)
      } else {
        setDateRange({ from, to })
        setSingleDate(undefined)
      }
    } else {
      setSingleDate(undefined)
      setDateRange(undefined)
    }
  }, [column, filterValueKey, mode])

  const handleSingleSelect = (date: Date | undefined) => {
    setSingleDate(date)

    if (date) {
      column?.setFilterValue({
        from: date,
        to: date,
      } as DateFilterValue)
    } else {
      column?.setFilterValue(undefined)
    }
  }

  const handleRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range)

    if (range?.from) {
      // Apply filter - if no "to" yet, use "from" as both
      const toDate = range.to || range.from
      column?.setFilterValue({
        from: range.from,
        to: toDate,
      } as DateFilterValue)
    } else {
      column?.setFilterValue(undefined)
    }
  }

  const handleClear = () => {
    setSingleDate(undefined)
    setDateRange(undefined)
    column?.setFilterValue(undefined)
    setOpen(false)
  }

  const hasFilter = mode === "single" ? !!singleDate : !!dateRange?.from
  const isSingleDate =
    mode === "single" ||
    (dateRange?.from &&
      dateRange?.to &&
      isSameDay(dateRange.from, dateRange.to))

  const getDisplayText = () => {
    if (mode === "single") {
      if (!singleDate) return title
      return format(singleDate, "d MMM yyyy", { locale: localeId })
    }

    if (!dateRange?.from) return title

    if (isSingleDate) {
      return format(dateRange.from, "d MMM yyyy", { locale: localeId })
    }

    if (dateRange.to) {
      return `${format(dateRange.from, "d MMM", { locale: localeId })} - ${format(dateRange.to, "d MMM yyyy", { locale: localeId })}`
    }

    return format(dateRange.from, "d MMM yyyy", { locale: localeId })
  }

  const getFilterInfo = () => {
    if (mode === "single") {
      if (!singleDate) return null
      return format(singleDate, "EEEE, d MMMM yyyy", { locale: localeId })
    }

    if (!dateRange?.from) return null

    if (isSingleDate) {
      return format(dateRange.from, "EEEE, d MMMM yyyy", { locale: localeId })
    }

    if (dateRange.to) {
      const days =
        Math.ceil(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      return `${format(dateRange.from, "d MMMM", { locale: localeId })} - ${format(dateRange.to, "d MMMM yyyy", { locale: localeId })} (${days} days)`
    }

    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed",
            hasFilter && "border-primary bg-primary/5"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className={cn(!hasFilter && "text-muted-foreground")}>
            {getDisplayText()}
          </span>
          {hasFilter && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-sm px-1 font-normal"
            >
              {mode === "single" ? "Single" : isSingleDate ? "Single" : "Range"}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Date filter</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pick a single day or a date range
          </p>
        </div>

        {/* Calendar */}
        {mode === "single" ? (
          <Calendar
            mode="single"
            selected={singleDate}
            onSelect={handleSingleSelect}
            initialFocus
            locale={localeId}
            className="p-3"
          />
        ) : (
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            initialFocus
            locale={localeId}
            className="p-3"
          />
        )}

        {/* Footer */}
        {hasFilter && (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted-foreground">
                  {getFilterInfo()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 shrink-0 gap-1 px-2 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
