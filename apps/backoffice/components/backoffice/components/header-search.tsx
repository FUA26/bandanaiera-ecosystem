"use client"

import { SearchIcon } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

export function HeaderSearch() {
  return (
    <div className="relative hidden md:block">
      <SearchIcon className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        className="h-9 w-64 rounded-full bg-background pr-4 pl-9 md:w-72 lg:w-80"
      />
    </div>
  )
}

export function HeaderSearchMobile() {
  return (
    <Button variant="ghost" size="icon" className="md:hidden">
      <SearchIcon className="size-5" />
      <span className="sr-only">Search</span>
    </Button>
  )
}
