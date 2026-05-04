"use client"

import { motion } from "framer-motion"
import { ArrowLeft, HelpCircle, Info, Upload } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { TicketType } from "@/lib/ticketing/ticket-types"
import { getTicketTypeConfig } from "@/lib/ticketing/form-templates"
import { BugReportTemplate } from "./form-templates/bug-report-template"
import { FeatureRequestTemplate } from "./form-templates/feature-request-template"
import { AccountIssueTemplate } from "./form-templates/account-issue-template"
import { TechnicalSupportTemplate } from "./form-templates/technical-support-template"
import { BillingInquiryTemplate } from "./form-templates/billing-inquiry-template"
import { OtherInquiryTemplate } from "./form-templates/other-inquiry-template"

interface SmartTicketFormProps {
  ticketType: TicketType
  subject: string
  templateData: Record<string, string>
  priority: string
  requesterName: string
  requesterEmail: string
  requesterPhone: string
  onSubjectChange: (value: string) => void
  onTemplateFieldChange: (field: string, value: string) => void
  onPriorityChange: (value: string) => void
  onRequesterNameChange: (value: string) => void
  onRequesterEmailChange: (value: string) => void
  onRequesterPhoneChange: (value: string) => void
  onFileUpload: (files: File[]) => void
  attachmentsEnabled: boolean
  onBack: () => void
  onSubmit: () => void
  isSubmitting?: boolean
  errors?: {
    subject?: string
    templateFields?: Record<string, string>
    requesterName?: string
    requesterEmail?: string
  }
}

const SUBJECT_PREFIXES: Record<TicketType, string> = {
  [TicketType.BUG_REPORT]: "[Bug]",
  [TicketType.FEATURE_REQUEST]: "[Feature]",
  [TicketType.ACCOUNT_ISSUE]: "[Account]",
  [TicketType.TECHNICAL_SUPPORT]: "[Support]",
  [TicketType.BILLING_INQUIRY]: "[Billing]",
  [TicketType.OTHER_INQUIRY]: "[Inquiry]",
}

const SUBMIT_LABELS: Record<TicketType, string> = {
  [TicketType.BUG_REPORT]: "Submit Bug Report",
  [TicketType.FEATURE_REQUEST]: "Submit Feature Request",
  [TicketType.ACCOUNT_ISSUE]: "Submit Account Issue",
  [TicketType.TECHNICAL_SUPPORT]: "Request Support",
  [TicketType.BILLING_INQUIRY]: "Submit Inquiry",
  [TicketType.OTHER_INQUIRY]: "Send Message",
}

export function SmartTicketForm({
  ticketType,
  subject,
  templateData,
  priority,
  requesterName,
  requesterEmail,
  requesterPhone,
  onSubjectChange,
  onTemplateFieldChange,
  onPriorityChange,
  onRequesterNameChange,
  onRequesterEmailChange,
  onRequesterPhoneChange,
  onFileUpload,
  attachmentsEnabled,
  onBack,
  onSubmit,
  isSubmitting = false,
  errors,
}: SmartTicketFormProps) {
  const config = getTicketTypeConfig(ticketType)
  if (!config) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFileUpload(files)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl space-y-8"
    >
      {/* Header */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to type selection
        </Button>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {config.label}
          </h2>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Contextual Questions */}
      {config.contextualQuestions.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              Helpful Context to Include
            </h3>
          </div>
          <ul className="space-y-2">
            {config.contextualQuestions.map((question, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-primary/90"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                {question}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Subject */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject <span className="text-destructive">*</span>
            </Label>
            <span
              className={`text-xs ${
                subject.length > 180
                  ? "font-medium text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {subject.length}/200
            </span>
          </div>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground">
              {SUBJECT_PREFIXES[ticketType]}
            </span>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Brief initial context for your issue or request"
              className="h-11 rounded-2xl border-border/70 bg-background/80 pl-24 shadow-sm"
              required
              maxLength={200}
            />
          </div>
          {errors?.subject && (
            <p className="text-sm text-destructive">{errors.subject}</p>
          )}
        </div>

        {/* Template Fields */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Initial Context</Label>
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
            {ticketType === TicketType.BUG_REPORT && (
              <BugReportTemplate
                data={templateData}
                onChange={onTemplateFieldChange}
                errors={errors?.templateFields}
              />
            )}
            {ticketType === TicketType.FEATURE_REQUEST && (
              <FeatureRequestTemplate
                data={templateData}
                onChange={onTemplateFieldChange}
                errors={errors?.templateFields}
              />
            )}
            {ticketType === TicketType.ACCOUNT_ISSUE && (
              <AccountIssueTemplate
                data={templateData}
                onChange={onTemplateFieldChange}
                errors={errors?.templateFields}
              />
            )}
            {ticketType === TicketType.TECHNICAL_SUPPORT && (
              <TechnicalSupportTemplate
                data={templateData}
                onChange={onTemplateFieldChange}
                errors={errors?.templateFields}
              />
            )}
            {ticketType === TicketType.BILLING_INQUIRY && (
              <BillingInquiryTemplate
                data={templateData}
                onChange={onTemplateFieldChange}
                errors={errors?.templateFields}
              />
            )}
            {ticketType === TicketType.OTHER_INQUIRY && (
              <OtherInquiryTemplate
                data={templateData}
                onChange={onTemplateFieldChange}
                errors={errors?.templateFields}
              />
            )}
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-sm font-medium">
            Priority <span className="text-destructive">*</span>
          </Label>
          <Select value={priority} onValueChange={onPriorityChange}>
            <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low - Minor issue</SelectItem>
              <SelectItem value="NORMAL">Normal - Standard priority</SelectItem>
              <SelectItem value="HIGH">
                High - Urgent attention needed
              </SelectItem>
              <SelectItem value="URGENT">
                Urgent - Critical business impact
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requester Info */}
        <div className="space-y-4 rounded-2xl border border-border/50 bg-card/50 p-6">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Contact Information</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={requesterName}
                onChange={(e) => onRequesterNameChange(e.target.value)}
                placeholder="Your name"
                className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
                required
              />
              {errors?.requesterName && (
                <p className="text-sm text-destructive">
                  {errors.requesterName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={requesterEmail}
                onChange={(e) => onRequesterEmailChange(e.target.value)}
                placeholder="your.email@example.com"
                className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
                required
              />
              {errors?.requesterEmail && (
                <p className="text-sm text-destructive">
                  {errors.requesterEmail}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={requesterPhone}
                onChange={(e) => onRequesterPhoneChange(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
              />
            </div>
          </div>
        </div>

        {attachmentsEnabled && (
          <div className="space-y-2">
            <Label htmlFor="attachments" className="text-sm font-medium">
              Attachments{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex items-center gap-4">
              <label htmlFor="attachments">
                <div className="flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-4 py-2 text-sm shadow-sm transition-colors hover:border-border">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span>Upload files</span>
                </div>
                <input
                  id="attachments"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-sm text-muted-foreground">
                Screenshots, logs, or documents (max 10MB each)
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-11 w-full rounded-2xl text-base font-medium"
        >
          {isSubmitting ? "Submitting..." : SUBMIT_LABELS[ticketType]}
        </Button>
      </div>
    </motion.div>
  )
}
