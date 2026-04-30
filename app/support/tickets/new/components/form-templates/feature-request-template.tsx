"use client"

import { GuidanceTextarea } from "../form-fields/guidance-textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Label } from "@workspace/ui/components/label"

interface FeatureRequestTemplateProps {
  data: {
    problemStatement?: string
    proposedSolution?: string
    useCase?: string
    alternatives?: string
    priority?: string
  }
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
}

export function FeatureRequestTemplate({
  data,
  onChange,
  errors,
}: FeatureRequestTemplateProps) {
  return (
    <div className="space-y-6">
      <GuidanceTextarea
        label="Problem Statement"
        value={data.problemStatement || ""}
        onChange={(value) => onChange("problemStatement", value)}
        placeholder="What problem would this feature solve?"
        guidance="Describe the current limitation or pain point you're experiencing. What's missing or frustrating about the current experience?"
        required
        rows={3}
        minLength={30}
        error={errors?.problemStatement}
      />

      <GuidanceTextarea
        label="Proposed Solution"
        value={data.proposedSolution || ""}
        onChange={(value) => onChange("proposedSolution", value)}
        placeholder="Describe your ideal solution..."
        guidance="How do you envision this feature working? Be specific about functionality, user interface, and integration with existing features."
        required
        rows={3}
        minLength={30}
        error={errors?.proposedSolution}
      />

      <GuidanceTextarea
        label="Use Case"
        value={data.useCase || ""}
        onChange={(value) => onChange("useCase", value)}
        placeholder="How would you use this feature? Provide specific examples..."
        guidance="Describe real scenarios where you would use this feature. Who would benefit? How often? What workflows would it improve?"
        required
        rows={3}
        minLength={30}
        error={errors?.useCase}
      />

      <GuidanceTextarea
        label="Alternative Solutions"
        value={data.alternatives || ""}
        onChange={(value) => onChange("alternatives", value)}
        placeholder="Have you considered other workarounds?"
        guidance="Share any workarounds or alternatives you've tried. This helps us understand your needs better."
        rows={2}
      />

      <div className="space-y-2">
        <Label htmlFor="priority" className="text-sm font-medium">
          Priority to You <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.priority || ""}
          onValueChange={(value) => onChange("priority", value)}
        >
          <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nice_to_have">Nice to have</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="critical">Critical for my workflow</SelectItem>
          </SelectContent>
        </Select>
        {errors?.priority && (
          <p className="text-sm text-destructive">{errors.priority}</p>
        )}
      </div>
    </div>
  )
}
