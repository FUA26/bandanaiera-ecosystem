"use client"

import { motion } from "framer-motion"
import { CheckCircle2, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppTicketTypeOption } from "@/lib/types/apps"

interface TicketTypeSelectorProps {
  selectedType: string | null
  availableTypes: AppTicketTypeOption[]
  onSelectType: (typeId: string) => void
}

export function TicketTypeSelector({
  selectedType,
  availableTypes,
  onSelectType,
}: TicketTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          What kind of issue are you experiencing?
        </h2>
        <p className="text-sm text-muted-foreground">
          Select the category that best describes your issue. This helps us
          route your ticket to the right team.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Select ticket type"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {availableTypes.map((type, index) => {
          const isSelected = selectedType === type.id

          return (
            <motion.button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={type.label}
              aria-describedby={`${type.id}-desc`}
              onClick={() => onSelectType(type.id)}
              className={cn(
                "group relative flex min-h-44 flex-col items-start rounded-2xl border border-border/70 bg-card/95 p-5 text-left shadow-sm backdrop-blur transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
                isSelected && "border-primary bg-primary/5"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </motion.div>
              )}

              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                <MessageCircle className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">{type.label}</h3>
                <p
                  id={`${type.id}-desc`}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {type.description?.trim() ||
                    "Describe your issue and our team will help route it correctly."}
                </p>
                <div className="pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {type.id}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
