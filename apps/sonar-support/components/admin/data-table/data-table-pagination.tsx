"use client"

import type { Table } from "@tanstack/react-table"
import type { ComponentProps } from "react"

import { DataTablePagination as ShadcnDataTablePagination } from "@workspace/ui/components/data-table/data-table-pagination"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps<TData> extends ComponentProps<"div"> {
  table: Table<TData>
  pageSizeOptions?: number[]
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
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  return (
    <ShadcnDataTablePagination
      table={table}
      pageSizeOptions={pageSizeOptions}
      className={cn(className)}
      {...props}
    />
  )
}
