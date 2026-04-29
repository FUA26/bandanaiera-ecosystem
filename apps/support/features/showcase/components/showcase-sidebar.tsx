"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Menu, X } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { categories, components } from "../lib/component-data"

export function ShowcaseSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isCategoryActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "#")
  }

  const isComponentActive = (path: string) => {
    const hash = path.split("#")[1]
    return hash ? pathname.endsWith(hash) : false
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-40 p-4 lg:hidden">
        <Button
          size="icon-xs"
          variant="outline"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 border-r border-border bg-background transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Link
              href="/components"
              className="font-semibold text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Components
            </Link>
            <Button
              size="icon-xs"
              variant="ghost"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-6">
              {categories.map((category) => (
                <li key={category.path}>
                  <Link
                    href={category.path}
                    className={cn(
                      "mb-2 flex items-center gap-1 text-sm font-medium",
                      isCategoryActive(category.path)
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <ChevronRight className="size-4" />
                    {category.name}
                  </Link>
                  <ul className="ml-6 space-y-1">
                    {category.components.map((componentKey) => {
                      const component = components[componentKey]
                      if (!component) return null
                      return (
                        <li key={componentKey}>
                          <Link
                            href={component.path}
                            className={cn(
                              "block rounded-md px-2 py-1 text-sm transition-colors",
                              isComponentActive(component.path)
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            {component.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
