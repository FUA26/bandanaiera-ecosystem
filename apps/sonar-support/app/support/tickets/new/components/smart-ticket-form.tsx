"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Info, Upload } from "lucide-react"
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
import { Textarea } from "@workspace/ui/components/textarea"
import type { AppTicketTypeOption } from "@/lib/types/apps"

interface SmartTicketFormProps {
  ticketType: AppTicketTypeOption
  subject: string
  message: string
  priority: string
  requesterName: string
  requesterEmail: string
  requesterPhone: string
  onSubjectChange: (value: string) => void
  onMessageChange: (value: string) => void
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
    message?: string
    requesterName?: string
    requesterEmail?: string
  }
}

export function SmartTicketForm({
  ticketType,
  subject,
  message,
  priority,
  requesterName,
  requesterEmail,
  requesterPhone,
  onSubjectChange,
  onMessageChange,
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) onFileUpload(files)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl space-y-6 sm:space-y-8"
    >
      <div className="space-y-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="-ml-2 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to type selection
        </Button>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {ticketType.label}
          </h2>
          <p className="text-muted-foreground">
            {ticketType.description?.trim() ||
              "Provide the details below so the support team can help you faster."}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
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
          <Input
            id="subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder={`Brief summary for ${ticketType.label.toLowerCase()}`}
            className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
            required
            maxLength={200}
          />
          {errors?.subject && (
            <p className="text-sm text-destructive">{errors.subject}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm font-medium">
            Details <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Describe the issue, request, or context in as much detail as possible..."
            rows={8}
            className="min-h-40 rounded-2xl border-border/70 bg-background/80 shadow-sm"
          />
          {errors?.message && (
            <p className="text-sm text-destructive">{errors.message}</p>
          )}
        </div>

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

        <div className="space-y-4 rounded-2xl border border-border/50 bg-card/50 p-4 sm:p-6">
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <label htmlFor="attachments">
                <div className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-4 py-2 text-sm shadow-sm transition-colors hover:border-border">
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

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-11 w-full rounded-2xl text-base font-medium"
        >
          {isSubmitting ? "Submitting..." : `Submit ${ticketType.label}`}
        </Button>
      </div>
    </motion.div>
  )
}
