"use client"

interface MetaRowProps {
  label: string
  value: string
}

export function MetaRow({ label, value }: MetaRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}
