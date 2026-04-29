"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"

interface DataTableActionBarProps<TData> {
  table: Table<TData>
  children?: (
    selectedRows: TData[],
    resetSelection: () => void
  ) => React.ReactNode
}

export function DataTableActionBar<TData>({
  table,
  children,
}: DataTableActionBarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length
  const selectedData = selectedRows.map((row) => row.original)

  const resetSelection = () => {
    table.resetRowSelection()
  }

  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in duration-300 fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 rounded-lg border bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {/* Selection count */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {selectedCount === 1 ? "row" : "rows"} selected
          </span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Custom actions */}
        {children && children(selectedData, resetSelection)}

        {/* Clear selection */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={resetSelection}
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}
