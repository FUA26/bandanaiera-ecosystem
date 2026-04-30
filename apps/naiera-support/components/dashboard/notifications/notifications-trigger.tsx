"use client"

import * as React from "react"

type NotificationsTriggerProps = React.ComponentProps<"button">

export function NotificationsTrigger({
  children,
  ...props
}: NotificationsTriggerProps) {
  return <button {...props}>{children}</button>
}
