"use client"

import * as React from "react"

type CommandDialogTriggerProps = React.ComponentProps<"button">

export function CommandDialogTrigger({
  children,
  ...props
}: CommandDialogTriggerProps) {
  return <button {...props}>{children}</button>
}
