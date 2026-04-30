export enum TicketType {
  BUG_REPORT = "BUG_REPORT",
  FEATURE_REQUEST = "FEATURE_REQUEST",
  ACCOUNT_ISSUE = "ACCOUNT_ISSUE",
  TECHNICAL_SUPPORT = "TECHNICAL_SUPPORT",
  BILLING_INQUIRY = "BILLING_INQUIRY",
  OTHER_INQUIRY = "OTHER_INQUIRY",
}

export interface TicketTypeConfig {
  id: TicketType
  label: string
  icon: string // lucide icon name
  description: string
  examples: string[]
  defaultPriority: "LOW" | "NORMAL" | "HIGH" | "URGENT"
  fields: FormFieldConfig[]
  contextualQuestions: string[]
}

export interface FormFieldConfig {
  name: string
  label: string
  type: "text" | "textarea" | "select" | "email" | "tel"
  required: boolean
  placeholder?: string
  maxLength?: number
  minLength?: number
  rows?: number // for textarea
  options?: Array<{ value: string; label: string }>
}

export interface FormData {
  selectedType: TicketType | null
  subject: string
  templateFields: Record<string, string>
  priority: string
  requesterInfo: {
    name: string
    email: string
    phone: string
  }
  attachments: Array<{
    file: File
    uploadedUrl?: string
  }>
}
