"use client"

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"
import { ComponentPreview } from "./component-preview"
import { CodeBlock } from "./code-block"

interface PreviewCodeTabsProps {
  preview: React.ReactNode
  code: string
  className?: string
}

export function PreviewCodeTabs({
  preview,
  code,
  className,
}: PreviewCodeTabsProps) {
  return (
    <Tabs defaultValue="preview" className={className}>
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <ComponentPreview>{preview}</ComponentPreview>
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock code={code} />
      </TabsContent>
    </Tabs>
  )
}
