"use client"

import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT"

interface PrioritySelectProps {
  value: Priority
  onChange: (value: Priority) => void
  disabled?: boolean
}

const PRIORITY_OPTIONS: Array<{
  value: Priority
  label: string
  description: string
}> = [
  {
    value: "LOW",
    label: "Low",
    description: "General inquiry or non-urgent request",
  },
  {
    value: "NORMAL",
    label: "Normal",
    description: "Standard request, normal processing time",
  },
  {
    value: "HIGH",
    label: "High",
    description: "Urgent issue requiring faster response",
  },
  {
    value: "URGENT",
    label: "Urgent",
    description: "Critical issue affecting operations",
  },
]

export function PrioritySelect({
  value,
  onChange,
  disabled = false,
}: PrioritySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="priority" className="text-sm font-medium text-foreground">
        Priority
      </Label>

      <Select
        value={value}
        onValueChange={(v) => onChange(v as Priority)}
        disabled={disabled}
      >
        <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
          <SelectValue placeholder="Select priority level" />
        </SelectTrigger>

        <SelectContent>
          {PRIORITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
