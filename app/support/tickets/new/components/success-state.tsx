"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { CheckCircle2 } from "lucide-react"
import { MetaRow } from "./meta-row"

interface SuccessStateProps {
  ticketId: string
  appLabel: string
  channelLabel: string
  onReset: () => void
}

export function SuccessState({
  ticketId,
  appLabel,
  channelLabel,
  onReset,
}: SuccessStateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="mx-auto w-full max-w-lg border-border/70 bg-card/95 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
        <CardHeader className="space-y-4 border-b border-border/60 bg-muted/20 p-6 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">
              Ticket Created Successfully
            </CardTitle>
            <CardDescription className="max-w-md">
              Your ticket has been created and is being processed.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div className="space-y-3">
            <MetaRow label="App" value={appLabel} />
            <MetaRow label="Channel" value={channelLabel} />
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
              Ticket number
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {ticketId}
            </p>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            We have sent a confirmation email with your ticket details. Use the
            ticket number to track progress later.
          </p>

          <Button onClick={onReset} className="w-full">
            Create Another Ticket
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
