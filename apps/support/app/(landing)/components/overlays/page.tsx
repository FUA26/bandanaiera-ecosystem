"use client"

import { useState } from "react"
import { PreviewCodeTabs } from "@/features/showcase/components/preview-code-tabs"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { ChevronRight } from "lucide-react"

export default function OverlaysPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [collapsibleOpen, setCollapsibleOpen] = useState(true)

  return (
    <div className="container px-4 py-12 pt-20 lg:px-8 lg:pt-12">
      <div className="max-w-4xl space-y-16">
        {/* Sheet Section */}
        <section id="sheet" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sheet
            </h1>
            <p className="mt-2 text-muted-foreground">
              Slide-over panel from any edge.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Right Side
            </h2>
            <PreviewCodeTabs
              preview={
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button>Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Sheet Title</h2>
                      <p className="text-sm text-muted-foreground">
                        This is the sheet content area.
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>
              }
              code={`import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"

<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Sheet Title</h2>
      <p className="text-sm text-muted-foreground">
        This is the sheet content area.
      </p>
    </div>
  </SheetContent>
</Sheet>`}
            />
          </div>
        </section>

        {/* Tooltip Section */}
        <section id="tooltip" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Tooltip
            </h1>
            <p className="mt-2 text-muted-foreground">
              Hover tooltip with positioning options.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Basic</h2>
            <PreviewCodeTabs
              preview={
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This is a tooltip</p>
                  </TooltipContent>
                </Tooltip>
              }
              code={`import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { Button } from "@workspace/ui/components/button"

<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>This is a tooltip</p>
  </TooltipContent>
</Tooltip>`}
            />
          </div>
        </section>

        {/* Sonner Section */}
        <section id="sonner" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sonner
            </h1>
            <p className="mt-2 text-muted-foreground">
              Toast notifications for user feedback.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Examples</h2>
            <PreviewCodeTabs
              preview={
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => toast.success("Operation successful")}
                  >
                    Success
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.error("Something went wrong")}
                  >
                    Error
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.info("Here is some information")}
                  >
                    Info
                  </Button>
                </div>
              }
              code={`import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"

<Button onClick={() => toast.success("Operation successful")}>
  Success
</Button>
<Button onClick={() => toast.error("Something went wrong")}>
  Error
</Button>
<Button onClick={() => toast.info("Here is some information")}>
  Info
</Button>`}
            />
          </div>
        </section>

        {/* Skeleton Section */}
        <section id="skeleton" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Skeleton
            </h1>
            <p className="mt-2 text-muted-foreground">
              Loading placeholder with various shapes.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Card Skeleton
            </h2>
            <PreviewCodeTabs
              preview={
                <div className="w-[300px] space-y-3 rounded-lg border p-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              }
              code={`import { Skeleton } from "@workspace/ui/components/skeleton"

<div className="space-y-3 p-4 border rounded-lg w-[300px]">
  <Skeleton className="h-5 w-2/3" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-4/5" />
</div>`}
            />
          </div>
        </section>

        {/* Collapsible Section */}
        <section id="collapsible" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Collapsible
            </h1>
            <p className="mt-2 text-muted-foreground">
              Expandable/collapsible content section.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Default</h2>
            <PreviewCodeTabs
              preview={
                <Collapsible
                  open={collapsibleOpen}
                  onOpenChange={setCollapsibleOpen}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronRight
                        className={`size-4 transition-transform ${collapsibleOpen ? "rotate-90" : ""}`}
                      />
                      Toggle Content
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <div className="rounded-md bg-muted p-4 text-sm">
                      This is the collapsible content that can be shown or
                      hidden.
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              }
              code={`import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { Button } from "@workspace/ui/components/button"
import { ChevronRight } from "lucide-react"

<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" size="sm">
      <ChevronRight className="size-4" />
      Toggle Content
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="pt-2">
    <div className="rounded-md bg-muted p-4">
      This is the collapsible content.
    </div>
  </CollapsibleContent>
</Collapsible>`}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
