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
import { Input } from "@workspace/ui/components/input"

interface BugReportTemplateProps {
  data: {
    steps?: string
    expectedBehavior?: string
    actualBehavior?: string
    browser?: string
    severity?: string
  }
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
}

export function BugReportTemplate({
  data,
  onChange,
  errors,
}: BugReportTemplateProps) {
  return (
    <div className="space-y-6">
      <GuidanceTextarea
        label="Steps to Reproduce"
        value={data.steps || ""}
        onChange={(value) => onChange("steps", value)}
        placeholder="Describe the exact steps to reproduce this bug..."
        guidance="Be as specific as possible. Include clicks, navigation paths, and any particular data or conditions that trigger the issue."
        required
        rows={4}
        minLength={20}
        error={errors?.steps}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <GuidanceTextarea
          label="Expected Behavior"
          value={data.expectedBehavior || ""}
          onChange={(value) => onChange("expectedBehavior", value)}
          placeholder="What did you expect to happen?"
          guidance="Describe what should have happened if the bug didn't exist."
          required
          rows={2}
          error={errors?.expectedBehavior}
        />

        <GuidanceTextarea
          label="Actual Behavior"
          value={data.actualBehavior || ""}
          onChange={(value) => onChange("actualBehavior", value)}
          placeholder="What actually happened?"
          guidance="Describe what actually happened. Include error messages, unexpected results, or deviations from expected behavior."
          required
          rows={2}
          error={errors?.actualBehavior}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="browser" className="text-sm font-medium">
            Browser/Environment{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="browser"
            type="text"
            value={data.browser || ""}
            onChange={(e) => onChange("browser", e.target.value)}
            placeholder="e.g., Chrome 120, Safari 17.2, Firefox 121"
            className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity" className="text-sm font-medium">
            Severity <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.severity || ""}
            onValueChange={(value) => onChange("severity", value)}
          >
            <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - Minor annoyance</SelectItem>
              <SelectItem value="medium">Medium - Affects workflow</SelectItem>
              <SelectItem value="high">
                High - Blocking critical functionality
              </SelectItem>
              <SelectItem value="critical">
                Critical - System unusable
              </SelectItem>
            </SelectContent>
          </Select>
          {errors?.severity && (
            <p className="text-sm text-destructive">{errors.severity}</p>
          )}
        </div>
      </div>
    </div>
  )
}
