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

interface OtherInquiryTemplateProps {
  data: {
    category?: string
    message?: string
    expectedResponse?: string
  }
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
}

export function OtherInquiryTemplate({
  data,
  onChange,
  errors,
}: OtherInquiryTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.category || ""}
          onValueChange={(value) => onChange("category", value)}
        >
          <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="feedback">Product Feedback</SelectItem>
            <SelectItem value="partnership">Partnership Inquiry</SelectItem>
            <SelectItem value="documentation">
              Documentation Question
            </SelectItem>
            <SelectItem value="general">General Question</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors?.category && (
          <p className="text-sm text-destructive">{errors.category}</p>
        )}
      </div>

      <GuidanceTextarea
        label="Your Message"
        value={data.message || ""}
        onChange={(value) => onChange("message", value)}
        placeholder="How can we help you?"
        guidance="Provide as much detail as possible so we can route your inquiry to the right team and respond quickly."
        required
        rows={6}
        minLength={20}
        error={errors?.message}
      />

      <div className="space-y-2">
        <Label htmlFor="expectedResponse" className="text-sm font-medium">
          Expected Response Time <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.expectedResponse || ""}
          onValueChange={(value) => onChange("expectedResponse", value)}
        >
          <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
            <SelectValue placeholder="Select response time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard response time</SelectItem>
            <SelectItem value="urgent">
              Urgent - Need response within 24 hours
            </SelectItem>
          </SelectContent>
        </Select>
        {errors?.expectedResponse && (
          <p className="text-sm text-destructive">{errors.expectedResponse}</p>
        )}
      </div>
    </div>
  )
}
