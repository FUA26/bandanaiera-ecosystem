"use client"

import { useCan } from "@workspace/hooks/rbac"
import type { Permission } from "@workspace/types"

interface CanProps {
  permission: Permission
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = useCan()

  if (!can(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
