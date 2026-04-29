"use client"

import * as React from "react"

const BreadcrumbContext = React.createContext<React.ReactNode | null>(null)

export function BreadcrumbProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() {
  return React.useContext(BreadcrumbContext)
}

export function BreadcrumbConsumer({
  fallback,
}: {
  fallback: React.ReactNode
}) {
  const breadcrumb = React.useContext(BreadcrumbContext)
  return <>{breadcrumb ?? fallback}</>
}
