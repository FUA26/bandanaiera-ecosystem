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

interface BillingInquiryTemplateProps {
  data: {
    inquiryType?: string
    invoiceNumber?: string
    amount?: string
    details?: string
    contactPreference?: string
  }
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
}

export function BillingInquiryTemplate({
  data,
  onChange,
  errors,
}: BillingInquiryTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="inquiryType" className="text-sm font-medium">
          Inquiry Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.inquiryType || ""}
          onValueChange={(value) => onChange("inquiryType", value)}
        >
          <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
            <SelectValue placeholder="Select inquiry type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="charge_question">
              Question About Charge
            </SelectItem>
            <SelectItem value="payment_method">
              Update Payment Method
            </SelectItem>
            <SelectItem value="refund">Refund Request</SelectItem>
            <SelectItem value="subscription">Subscription Change</SelectItem>
            <SelectItem value="invoice">Invoice Issue</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors?.inquiryType && (
          <p className="text-sm text-destructive">{errors.inquiryType}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber" className="text-sm font-medium">
            Invoice Number{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="invoiceNumber"
            type="text"
            value={data.invoiceNumber || ""}
            onChange={(e) => onChange("invoiceNumber", e.target.value)}
            placeholder="If applicable, provide invoice number"
            className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">
            Amount <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="amount"
            type="text"
            value={data.amount || ""}
            onChange={(e) => onChange("amount", e.target.value)}
            placeholder="Amount in question (optional)"
            className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
          />
        </div>
      </div>

      <GuidanceTextarea
        label="Details"
        value={data.details || ""}
        onChange={(value) => onChange("details", value)}
        placeholder="Please provide details about your inquiry..."
        guidance="Include all relevant information: what you're asking about, reference numbers, dates, and any other context that would help us assist you."
        required
        rows={4}
        minLength={20}
        error={errors?.details}
      />

      <div className="space-y-2">
        <Label htmlFor="contactPreference" className="text-sm font-medium">
          Preferred Contact Method <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.contactPreference || ""}
          onValueChange={(value) => onChange("contactPreference", value)}
        >
          <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
            <SelectValue placeholder="Select contact method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
          </SelectContent>
        </Select>
        {errors?.contactPreference && (
          <p className="text-sm text-destructive">{errors.contactPreference}</p>
        )}
      </div>
    </div>
  )
}
