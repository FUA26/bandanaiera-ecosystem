"use client"

import { Table } from "@tanstack/react-table"
import type { ComponentProps, ReactNode } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps<TData> extends ComponentProps<"div"> {
  table: Table<TData>
  pageSizeOptions?: number[]
  leftContent?: ReactNode
}

interface DataTablePaginationSummaryProps<TData> {
  table: Table<TData>
  itemLabelSingular: string
  itemLabelPlural?: string
}

export function DataTablePaginationSummary<TData>({
  table,
  itemLabelSingular,
  itemLabelPlural,
}: DataTablePaginationSummaryProps<TData>) {
  const filteredCount = table.getFilteredRowModel().rows.length
  const totalCount = table.getCoreRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const start = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
  const end =
    filteredCount === 0 ? 0 : Math.min(start + pageSize - 1, filteredCount)
  const label =
    totalCount === 1
      ? itemLabelSingular
      : (itemLabelPlural ?? `${itemLabelSingular}s`)

  if (totalCount === 0) {
    return <span className="text-sm text-muted-foreground">No {label} yet</span>
  }

  if (filteredCount === 0) {
    return (
      <span className="text-sm text-muted-foreground">
        No {label} match the current filters
      </span>
    )
  }

  return (
    <span className="text-sm text-muted-foreground">
      Showing <span className="font-medium text-foreground">{start}</span>-
      <span className="font-medium text-foreground">{end}</span> of{" "}
      <span className="font-medium text-foreground">{filteredCount}</span>{" "}
      {label}
      {filteredCount !== totalCount && (
        <span className="ml-2 text-muted-foreground">
          filtered from {totalCount}
        </span>
      )}
    </span>
  )
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  leftContent,
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = Math.max(table.getPageCount(), 1)
  const canGoPrevious = table.getCanPreviousPage()
  const canGoNext = table.getCanNextPage()

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 text-sm text-muted-foreground">
          {leftContent ??
            (table.getFilteredSelectedRowModel().rows.length > 0 && (
              <span>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </span>
            ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium whitespace-nowrap text-foreground/80">
              Rows per page
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-9 w-[82px] rounded-full bg-background">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground">
              Page {pageIndex + 1} of {pageCount}
            </div>

            <div className="inline-flex items-center rounded-full border border-border/70 bg-background p-1 shadow-sm">
              <Button
                aria-label="Go to first page"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={() => table.setPageIndex(0)}
                disabled={!canGoPrevious}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Go to previous page"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={() => table.previousPage()}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Go to next page"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={() => table.nextPage()}
                disabled={!canGoNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Go to last page"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!canGoNext}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
        <Input
          type="number"
          min={1}
          max={pageCount}
          value={pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0
            if (page >= 0 && page < pageCount) {
              table.setPageIndex(page)
            }
          }}
          className="h-9 w-16 rounded-full text-center"
        />
        <span>Jump to a page when you need a direct hop.</span>
      </div>
    </div>
  )
}
