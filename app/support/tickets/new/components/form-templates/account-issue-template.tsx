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

interface AccountIssueTemplateProps {
  data: {
    accountType?: string
    issueType?: string
    affectedUsers?: string
    recentChanges?: string
    urgency?: string
  }
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
}

export function AccountIssueTemplate({
  data,
  onChange,
  errors,
}: AccountIssueTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="accountType" className="text-sm font-medium">
            Account Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.accountType || ""}
            onValueChange={(value) => onChange("accountType", value)}
          >
            <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal Account</SelectItem>
              <SelectItem value="organization">Organization Account</SelectItem>
              <SelectItem value="team">Team Account</SelectItem>
            </SelectContent>
          </Select>
          {errors?.accountType && (
            <p className="text-sm text-destructive">{errors.accountType}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="issueType" className="text-sm font-medium">
            Issue Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.issueType || ""}
            onValueChange={(value) => onChange("issueType", value)}
          >
            <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
              <SelectValue placeholder="Select issue type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="access">Access/Login Problem</SelectItem>
              <SelectItem value="settings">Settings/Profile</SelectItem>
              <SelectItem value="permissions">Permissions/Roles</SelectItem>
              <SelectItem value="billing">Billing/Subscription</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors?.issueType && (
            <p className="text-sm text-destructive">{errors.issueType}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="affectedUsers" className="text-sm font-medium">
          Affected Users{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="affectedUsers"
          type="text"
          value={data.affectedUsers || ""}
          onChange={(e) => onChange("affectedUsers", e.target.value)}
          placeholder="Just you or multiple users?"
          className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
        />
      </div>

      <GuidanceTextarea
        label="Recent Changes"
        value={data.recentChanges || ""}
        onChange={(value) => onChange("recentChanges", value)}
        placeholder="Any recent changes to your account or organization?"
        guidance="Share any recent changes that might be relevant: new team members, role changes, subscription updates, etc."
        rows={2}
      />

      <div className="space-y-2">
        <Label htmlFor="urgency" className="text-sm font-medium">
          Urgency <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.urgency || ""}
          onValueChange={(value) => onChange("urgency", value)}
        >
          <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
            <SelectValue placeholder="Select urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - Can wait a few days</SelectItem>
            <SelectItem value="medium">
              Medium - Affecting productivity
            </SelectItem>
            <SelectItem value="high">High - Completely blocked</SelectItem>
          </SelectContent>
        </Select>
        {errors?.urgency && (
          <p className="text-sm text-destructive">{errors.urgency}</p>
        )}
      </div>
    </div>
  )
}
