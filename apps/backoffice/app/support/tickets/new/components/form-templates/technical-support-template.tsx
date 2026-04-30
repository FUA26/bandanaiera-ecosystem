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

interface TechnicalSupportTemplateProps {
  data: {
    topic?: string
    environment?: string
    question?: string
    currentSetup?: string
    errorMessages?: string
  }
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
}

export function TechnicalSupportTemplate({
  data,
  onChange,
  errors,
}: TechnicalSupportTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-sm font-medium">
            Support Topic <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.topic || ""}
            onValueChange={(value) => onChange("topic", value)}
          >
            <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="integration">API Integration</SelectItem>
              <SelectItem value="configuration">Configuration/Setup</SelectItem>
              <SelectItem value="data">Data Management</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="security">Security/Authentication</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors?.topic && (
            <p className="text-sm text-destructive">{errors.topic}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="environment" className="text-sm font-medium">
            Environment{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <input
            id="environment"
            type="text"
            value={data.environment || ""}
            onChange={(e) => onChange("environment", e.target.value)}
            placeholder="e.g., Production, Staging, Development"
            className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
      </div>

      <GuidanceTextarea
        label="Your Question"
        value={data.question || ""}
        onChange={(value) => onChange("question", value)}
        placeholder="Describe what you need help with..."
        guidance="Be specific about what you're trying to accomplish and what you need help with. Include relevant context about your use case."
        required
        rows={4}
        minLength={30}
        error={errors?.question}
      />

      <GuidanceTextarea
        label="Current Setup"
        value={data.currentSetup || ""}
        onChange={(value) => onChange("currentSetup", value)}
        placeholder="Share relevant details about your current configuration..."
        guidance="Include information about your setup: versions, configurations, integrations, or any other relevant details."
        rows={3}
      />

      <GuidanceTextarea
        label="Error Messages"
        value={data.errorMessages || ""}
        onChange={(value) => onChange("errorMessages", value)}
        placeholder="Paste any error messages you're seeing..."
        guidance="If you're encountering errors, copy and paste the exact error messages. Include stack traces if available."
        rows={2}
      />
    </div>
  )
}
