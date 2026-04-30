# Ticket Creation Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the support ticket creation page with a progressive template-first flow that guides users through selecting a ticket type and completing a smart, contextual form.

**Architecture:** Client-side React component with type-based template system. Form state managed with React Hook Form + Zod validation. API integration extends existing ticket creation endpoint to accept structured template data.

**Tech Stack:** Next.js 16, React 19, React Hook Form, Zod, shadcn/ui, Tailwind CSS v4, TypeScript

---

## File Structure

```
apps/naiera-support/
├── app/support/tickets/new/
│   ├── page.tsx (modify - simplify to wrapper)
│   └── components/
│       ├── ticket-type-selector.tsx (create)
│       ├── smart-ticket-form.tsx (create)
│       ├── form-templates/
│       │   ├── bug-report-template.tsx (create)
│       │   ├── feature-request-template.tsx (create)
│       │   ├── account-issue-template.tsx (create)
│       │   ├── technical-support-template.tsx (create)
│       │   ├── billing-inquiry-template.tsx (create)
│       │   └── other-inquiry-template.tsx (create)
│       ├── success-state.tsx (create)
│       ├── loading-state.tsx (modify - enhance)
│       └── form-fields/
│           ├── subject-input.tsx (create)
│           ├── guidance-textarea.tsx (create)
│           ├── priority-select.tsx (create)
│           └── requester-info.tsx (create)
├── lib/ticketing/
│   ├── ticket-types.ts (create - type definitions)
│   └── form-templates.ts (create - template configs)
└── app/api/public/tickets/
    └── route.ts (modify - accept ticketType & templateFields)
```

---

## Task 1: Create Type System and Configuration

**Files:**

- Create: `apps/naiera-support/lib/ticketing/ticket-types.ts`
- Create: `apps/naiera-support/lib/ticketing/form-templates.ts`

- [ ] **Step 1: Define ticket type enum and interfaces**

```typescript
// apps/naiera-support/lib/ticketing/ticket-types.ts

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
```

- [ ] **Step 2: Define template configurations**

```typescript
// apps/naiera-support/lib/ticketing/form-templates.ts

import { TicketType, TicketTypeConfig } from "./ticket-types"
import {
  Bug,
  Lightbulb,
  User,
  Wrench,
  CreditCard,
  MessageCircle,
} from "lucide-react"

export const TICKET_TYPE_CONFIGS: Record<TicketType, TicketTypeConfig> = {
  [TicketType.BUG_REPORT]: {
    id: TicketType.BUG_REPORT,
    label: "Bug Report",
    icon: "Bug",
    description: "Software defects, errors, unexpected behavior",
    examples: ["Login, crashes, error messages"],
    defaultPriority: "NORMAL",
    contextualQuestions: [
      "What were you doing when the bug occurred?",
      "What did you expect to happen?",
      "What actually happened instead?",
    ],
    fields: [
      {
        name: "stepsToReproduce",
        label: "Steps to reproduce",
        type: "textarea",
        required: true,
        placeholder: "Describe the steps that led to the bug, step by step...",
        rows: 5,
        minLength: 20,
      },
      {
        name: "expectedBehavior",
        label: "Expected behavior",
        type: "textarea",
        required: true,
        placeholder: "What did you expect to happen?",
        rows: 3,
        minLength: 10,
      },
      {
        name: "actualBehavior",
        label: "Actual behavior",
        type: "textarea",
        required: true,
        placeholder: "What actually happened instead?",
        rows: 3,
        minLength: 10,
      },
      {
        name: "environmentInfo",
        label: "Environment information",
        type: "text",
        required: false,
        placeholder: "Browser, OS, app version (optional)",
      },
    ],
  },

  [TicketType.FEATURE_REQUEST]: {
    id: TicketType.FEATURE_REQUEST,
    label: "Feature Request",
    icon: "Lightbulb",
    description: "New features, enhancements, improvements",
    examples: ["New integrations, UI improvements, API additions"],
    defaultPriority: "LOW",
    contextualQuestions: [
      "What problem would this solve?",
      "How would you envision this working?",
      "Are there workarounds you are using now?",
    ],
    fields: [
      {
        name: "problemStatement",
        label: "Problem statement",
        type: "textarea",
        required: true,
        placeholder: "What problem would this feature solve?",
        rows: 4,
        minLength: 20,
      },
      {
        name: "proposedSolution",
        label: "Proposed solution",
        type: "textarea",
        required: true,
        placeholder: "How would you envision this working?",
        rows: 4,
        minLength: 20,
      },
      {
        name: "useCaseDetails",
        label: "Use case details",
        type: "textarea",
        required: false,
        placeholder: "Any additional context about your use case...",
        rows: 3,
      },
      {
        name: "priorityContext",
        label: "How important is this?",
        type: "select",
        required: true,
        options: [
          { value: "nice_to_have", label: "Nice to have" },
          { value: "important", label: "Important" },
          { value: "critical", label: "Critical" },
        ],
      },
    ],
  },

  [TicketType.ACCOUNT_ISSUE]: {
    id: TicketType.ACCOUNT_ISSUE,
    label: "Account Issue",
    icon: "User",
    description: "Login, access, profile, or billing problems",
    examples: ["Password reset, permissions, account settings"],
    defaultPriority: "HIGH",
    contextualQuestions: [
      "What aspect of your account is affected?",
      "When did this issue start?",
    ],
    fields: [
      {
        name: "issueType",
        label: "Issue type",
        type: "select",
        required: true,
        options: [
          { value: "login", label: "Login" },
          { value: "access", label: "Access" },
          { value: "profile", label: "Profile" },
          { value: "settings", label: "Settings" },
        ],
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Please describe your account issue...",
        rows: 5,
        minLength: 20,
      },
      {
        name: "whenStarted",
        label: "When did this start?",
        type: "text",
        required: false,
        placeholder: "Today, 2 days ago, etc.",
      },
    ],
  },

  [TicketType.TECHNICAL_SUPPORT]: {
    id: TicketType.TECHNICAL_SUPPORT,
    label: "Technical Support",
    icon: "Wrench",
    description: "Configuration, setup, or technical guidance",
    examples: ["API questions, installation, troubleshooting"],
    defaultPriority: "NORMAL",
    contextualQuestions: [
      "What are you trying to accomplish?",
      "What have you tried so far?",
      "Any error messages or unexpected behavior?",
    ],
    fields: [
      {
        name: "goal",
        label: "What are you trying to accomplish?",
        type: "textarea",
        required: true,
        placeholder: "Describe your goal or what you want to achieve...",
        rows: 4,
        minLength: 20,
      },
      {
        name: "stepsTaken",
        label: "What have you tried so far?",
        type: "textarea",
        required: true,
        placeholder: "List the steps you have already taken...",
        rows: 4,
        minLength: 20,
      },
      {
        name: "errorMessages",
        label: "Error messages",
        type: "textarea",
        required: false,
        placeholder: "Any error messages or unexpected behavior...",
        rows: 3,
      },
      {
        name: "environment",
        label: "Environment",
        type: "text",
        required: false,
        placeholder: "OS, browser, app version (optional)",
      },
    ],
  },

  [TicketType.BILLING_INQUIRY]: {
    id: TicketType.BILLING_INQUIRY,
    label: "Billing Inquiry",
    icon: "CreditCard",
    description: "Payments, invoices, subscriptions, or refunds",
    examples: ["Upgrade, downgrade, payment issues"],
    defaultPriority: "HIGH",
    contextualQuestions: [
      "What billing aspect concerns you?",
      "Do you have a reference number (invoice, transaction)?",
    ],
    fields: [
      {
        name: "inquiryType",
        label: "Inquiry type",
        type: "select",
        required: true,
        options: [
          { value: "payment", label: "Payment" },
          { value: "invoice", label: "Invoice" },
          { value: "subscription", label: "Subscription" },
          { value: "refund", label: "Refund" },
        ],
      },
      {
        name: "referenceNumber",
        label: "Reference number",
        type: "text",
        required: false,
        placeholder: "Invoice or transaction number (optional)",
      },
      {
        name: "details",
        label: "Details",
        type: "textarea",
        required: true,
        placeholder: "Please describe your billing inquiry...",
        rows: 5,
        minLength: 20,
      },
    ],
  },

  [TicketType.OTHER_INQUIRY]: {
    id: TicketType.OTHER_INQUIRY,
    label: "Other Inquiry",
    icon: "MessageCircle",
    description: "General questions or anything else",
    examples: ["Partnership, feedback, general support"],
    defaultPriority: "NORMAL",
    contextualQuestions: ["How can we help you today?"],
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        required: false,
        options: [
          { value: "partnership", label: "Partnership" },
          { value: "feedback", label: "Feedback" },
          { value: "general", label: "General" },
          { value: "legal", label: "Legal" },
        ],
      },
      {
        name: "message",
        label: "Message",
        type: "textarea",
        required: true,
        placeholder: "How can we help you today?",
        rows: 6,
        minLength: 20,
      },
    ],
  },
}

export function getTicketTypeConfig(type: TicketType): TicketTypeConfig {
  return TICKET_TYPE_CONFIGS[type]
}

export function getIconComponent(iconName: string) {
  const icons = {
    Bug,
    Lightbulb,
    User,
    Wrench,
    CreditCard,
    MessageCircle,
  }
  return icons[iconName as keyof typeof icons] || MessageCircle
}
```

- [ ] **Step 3: Run TypeScript type check**

Run: `pnpm typecheck --filter naiera-support`
Expected: PASS (no type errors)

- [ ] **Step 4: Commit**

```bash
git add apps/naiera-support/lib/ticketing/
git commit -m "feat(ticketing): add ticket type system and template configurations

Define ticket type enum, interfaces, and 6 type-specific templates
with contextual questions and form field configurations."
```

---

## Task 2: Create Ticket Type Selector Component

**Files:**

- Create: `apps/naiera-support/app/support/tickets/new/components/ticket-type-selector.tsx`
- Modify: `apps/naiera-support/app/support/tickets/new/page.tsx` (import and use)

- [ ] **Step 1: Write the type selector component**

```typescript
// apps/naiera-support/app/support/tickets/new/components/ticket-type-selector.tsx

'use client'

import { TicketType, getTicketTypeConfig, getIconComponent } from '@/lib/ticketing/ticket-types'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface TicketTypeSelectorProps {
  selectedType: TicketType | null
  onSelectType: (type: TicketType) => void
}

export function TicketTypeSelector({
  selectedType,
  onSelectType,
}: TicketTypeSelectorProps) {
  const ticketTypes = Object.values(TicketType)

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          What type of issue are you experiencing?
        </h2>
        <p className="text-base leading-7 text-muted-foreground">
          Select the category that best describes your situation. This helps us
          route your ticket to the right team and gather the most relevant
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ticketTypes.map((type) => {
          const config = getTicketTypeConfig(type)
          const IconComponent = getIconComponent(config.icon)
          const isSelected = selectedType === type

          return (
            <motion.button
              key={type}
              type="button"
              onClick={() => onSelectType(type)}
              className={cn(
                'group relative flex flex-col items-start rounded-2xl border p-6 text-left transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-0.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border/70 bg-card hover:border-primary/50'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}

              <div
                className={cn(
                  'mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                  isSelected
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                )}
              >
                <IconComponent className="h-6 w-6" />
              </div>

              <h3 className="mb-2 font-semibold text-foreground">
                {config.label}
              </h3>

              <p className="mb-3 text-sm leading-6 text-muted-foreground">
                {config.description}
              </p>

              <div className="mt-auto">
                <p className="text-xs text-muted-foreground">
                  Examples: {config.examples.join(', ')}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update page.tsx to use the selector**

```typescript
// apps/naiera-support/app/support/tickets/new/page.tsx

// Add to imports:
import { TicketTypeSelector } from './components/ticket-type-selector'
import { TicketType } from '@/lib/ticketing/ticket-types'

// In TicketForm component, add state:
const [selectedType, setSelectedType] = useState<TicketType | null>(null)

// Replace the existing form rendering with:
{!selectedType ? (
  <TicketTypeSelector
    selectedType={selectedType}
    onSelectType={setSelectedType}
  />
) : (
  // Existing form will be wrapped in Task 3
)}
```

- [ ] **Step 3: Install framer-motion if not present**

Run: `pnpm add framer-motion --filter naiera-support`
Expected: PASS

- [ ] **Step 4: Run dev server and verify type selector renders**

Run: `pnpm dev --filter naiera-support`
Expected: Type selector grid displays with 6 cards, hover effects work, click selects type

- [ ] **Step 5: Commit**

```bash
git add apps/naiera-support/app/support/tickets/new/components/ticket-type-selector.tsx
git add apps/naiera-support/app/support/tickets/new/page.tsx
git commit -m "feat(ticket-form): add ticket type selector component

Implement visual grid selector for 6 ticket types with icons,
descriptions, and examples. Add hover animations and selection state."
```

---

## Task 3: Create Reusable Form Field Components

**Files:**

- Create: `apps/naiera-support/app/support/tickets/new/components/form-fields/subject-input.tsx`
- Create: `apps/naiera-support/app/support/tickets/new/components/form-fields/guidance-textarea.tsx`
- Create: `apps/naiera-support/app/support/tickets/new/components/form-fields/priority-select.tsx`
- Create: `apps/naiera-support/app/support/tickets/new/components/form-fields/requester-info.tsx`

- [ ] **Step 1: Create subject input component**

```typescript
// apps/naiera-support/app/support/tickets/new/components/form-fields/subject-input.tsx

'use client'

import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'

interface SubjectInputProps {
  value: string
  onChange: (value: string) => void
  prefix?: string
  error?: string
  required?: boolean
}

export function SubjectInput({
  value,
  onChange,
  prefix = '',
  error,
  required = true,
}: SubjectInputProps) {
  const charCount = value.length
  const maxLength = 200
  const isNearLimit = charCount > maxLength * 0.9

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="subject"
          className={cn(
            'text-sm font-medium text-foreground',
            error && 'text-destructive'
          )}
        >
          Subject
          {required && <span className="text-destructive">*</span>}
        </Label>
        <span
          className={cn(
            'text-xs',
            isNearLimit
              ? 'text-destructive font-medium'
              : 'text-muted-foreground'
          )}
        >
          {charCount}/{maxLength}
        </span>
      </div>

      <Input
        id="subject"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={prefix ? `${prefix}: [brief description]` : 'Brief description'}
        required={required}
        minLength={5}
        maxLength={maxLength}
        className={cn(
          'h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm',
          error && 'border-destructive focus-visible:ring-destructive'
        )}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create guidance textarea component**

```typescript
// apps/naiera-support/app/support/tickets/new/components/form-fields/guidance-textarea.tsx

'use client'

import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuidanceTextareaProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  guidance?: string
  required?: boolean
  minLength?: number
  maxLength?: number
  rows?: number
  error?: string
}

export function GuidanceTextarea({
  label,
  value,
  onChange,
  placeholder,
  guidance,
  required = false,
  minLength,
  maxLength = 5000,
  rows = 4,
  error,
}: GuidanceTextareaProps) {
  const charCount = value.length
  const isNearLimit = charCount > maxLength * 0.9
  const isTooShort = minLength && charCount > 0 && charCount < minLength

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={label}
          className={cn(
            'text-sm font-medium text-foreground',
            error && 'text-destructive'
          )}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <span
          className={cn(
            'text-xs',
            isNearLimit || isTooShort
              ? 'text-destructive font-medium'
              : 'text-muted-foreground'
          )}
        >
          {charCount}/{maxLength}
        </span>
      </div>

      {guidance && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-primary/90">{guidance}</p>
        </div>
      )}

      <Textarea
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        rows={rows}
        className={cn(
          'min-h-[120px] rounded-2xl border-border/70 bg-background/80 shadow-sm',
          error && 'border-destructive focus-visible:ring-destructive'
        )}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {minLength && charCount > 0 && charCount < minLength && (
        <p className="text-sm text-muted-foreground">
          Minimum {minLength} characters required ({charCount}/{minLength})
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create priority select component**

```typescript
// apps/naiera-support/app/support/tickets/new/components/form-fields/priority-select.tsx

'use client'

import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

interface PrioritySelectProps {
  value: Priority
  onChange: (value: Priority) => void
  disabled?: boolean
}

const PRIORITY_OPTIONS: Array<{
  value: Priority
  label: string
  description: string
}> = [
  {
    value: 'LOW',
    label: 'Low',
    description: 'General inquiry or non-urgent request',
  },
  {
    value: 'NORMAL',
    label: 'Normal',
    description: 'Standard request, normal processing time',
  },
  {
    value: 'HIGH',
    label: 'High',
    description: 'Urgent issue requiring faster response',
  },
  {
    value: 'URGENT',
    label: 'Urgent',
    description: 'Critical issue affecting operations',
  },
]

export function PrioritySelect({
  value,
  onChange,
  disabled = false,
}: PrioritySelectProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="priority"
        className="text-sm font-medium text-foreground"
      >
        Priority
      </Label>

      <Select
        value={value}
        onValueChange={(v) => onChange(v as Priority)}
        disabled={disabled}
      >
        <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
          <SelectValue placeholder="Select priority level" />
        </SelectTrigger>

        <SelectContent>
          {PRIORITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

- [ ] **Step 4: Create requester info component**

```typescript
// apps/naiera-support/app/support/tickets/new/components/form-fields/requester-info.tsx

'use client'

import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { User, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RequesterInfoProps {
  name: string
  email: string
  phone: string
  onChange: (field: 'name' | 'email' | 'phone', value: string) => void
  emailLocked?: boolean
  tokenValid?: boolean
  externalUserId?: string
  errors?: {
    name?: string
    email?: string
    phone?: string
  }
}

export function RequesterInfo({
  name,
  email,
  phone,
  onChange,
  emailLocked = false,
  tokenValid = false,
  externalUserId,
  errors,
}: RequesterInfoProps) {
  if (externalUserId) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 dark:bg-primary/15">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">
              Signed in as <strong>{externalUserId}</strong>
            </p>
            <p className="text-sm leading-6 text-primary/80">
              Your request will be linked directly to your account.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="guestName"
          className="flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <User className="h-4 w-4" />
          Name
          <span className="text-xs font-normal text-muted-foreground">
            (Optional)
          </span>
        </Label>
        <Input
          id="guestName"
          type="text"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className={cn(
            'h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm',
            errors?.name && 'border-destructive'
          )}
        />
        {errors?.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="guestEmail"
          className="flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <Mail className="h-4 w-4" />
          Email
          {emailLocked && (
            <span className="ml-auto text-xs font-normal text-emerald-600 dark:text-emerald-400">
              Verified and locked
            </span>
          )}
        </Label>
        <Input
          id="guestEmail"
          type="email"
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          required
          readOnly={emailLocked}
          className={cn(
            'h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm',
            emailLocked && 'cursor-not-allowed bg-muted/70',
            errors?.email && 'border-destructive'
          )}
        />
        {emailLocked && (
          <p className="text-xs leading-5 text-muted-foreground">
            The verified email is locked for security.
          </p>
        )}
        {errors?.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="guestPhone"
          className="flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <Phone className="h-4 w-4" />
          Phone
          <span className="text-xs font-normal text-muted-foreground">
            (Optional)
          </span>
        </Label>
        <Input
          id="guestPhone"
          type="tel"
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+62 812 3456 7890"
          autoComplete="tel"
          className={cn(
            'h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm',
            errors?.phone && 'border-destructive'
          )}
        />
        {errors?.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Type check form field components**

Run: `pnpm typecheck --filter naiera-support`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/naiera-support/app/support/tickets/new/components/form-fields/
git commit -m "feat(ticket-form): add reusable form field components

Create SubjectInput, GuidanceTextarea, PrioritySelect, and
RequesterInfo components with validation, character limits, and
error handling."
```

---

## Task 4: Create Smart Form Component

**Files:**

- Create: `apps/naiera-support/app/support/tickets/new/components/smart-ticket-form.tsx`
- Create: `apps/naiera-support/app/support/tickets/new/components/form-templates/bug-report-template.tsx`
- Create: `apps/naiera-support/app/support/tickets/new/components/form-templates/feature-request-template.tsx`
- Create: `apps/naiera-support/app/support/tickets/new/components/form-templates/account-issue-template.tsx`
- Create: `apps/naiera-support/app/support/tickets/new/components/form-templates/technical-support-template.tsx`
- Create: `apps/naiera-support/app/support/tickets/new/components/form-templates/billing-inquiry-template.tsx`
- Create: `apps/naiera-support/app/support/tickets/new/components/form-templates/other-inquiry-template.tsx`

- [ ] **Step 1: Create bug report template**

```typescript
// apps/naiera-support/app/support/tickets/new/components/form-templates/bug-report-template.tsx

'use client'

import { GuidanceTextarea } from '../form-fields/guidance-textarea'

interface BugReportTemplateProps {
  fields: Record<string, string>
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
}

export function BugReportTemplate({
  fields,
  onChange,
  errors,
}: BugReportTemplateProps) {
  return (
    <div className="space-y-5">
      <GuidanceTextarea
        label="Steps to reproduce"
        value={fields.stepsToReproduce || ''}
        onChange={(value) => onChange('stepsToReproduce', value)}
        placeholder="Describe the steps that led to the bug, step by step..."
        guidance="What were you doing when the bug occurred?"
        required
        minLength={20}
        rows={5}
        error={errors?.stepsToReproduce}
      />

      <GuidanceTextarea
        label="Expected behavior"
        value={fields.expectedBehavior || ''}
        onChange={(value) => onChange('expectedBehavior', value)}
        placeholder="What did you expect to happen?"
        guidance="What did you expect to happen?"
        required
        minLength={10}
        rows={3}
        error={errors?.expectedBehavior}
      />

      <GuidanceTextarea
        label="Actual behavior"
        value={fields.actualBehavior || ''}
        onChange={(value) => onChange('actualBehavior', value)}
        placeholder="What actually happened instead?"
        guidance="What actually happened instead?"
        required
        minLength={10}
        rows={3}
        error={errors?.actualBehavior}
      />

      <GuidanceTextarea
        label="Environment information"
        value={fields.environmentInfo || ''}
        onChange={(value) => onChange('environmentInfo', value)}
        placeholder="Browser, OS, app version (optional)"
        required={false}
        rows={2}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create feature request template**

```typescript
// apps/naiera-support/app/support/tickets/new/components/form-templates/feature-request-template.tsx

'use client'

import { GuidanceTextarea } from '../form-fields/guidance-textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Label } from '@workspace/ui/components/label'

interface FeatureRequestTemplateProps {
  fields: Record<string, string>
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
}

export function FeatureRequestTemplate({
  fields,
  onChange,
  errors,
}: FeatureRequestTemplateProps) {
  return (
    <div className="space-y-5">
      <GuidanceTextarea
        label="Problem statement"
        value={fields.problemStatement || ''}
        onChange={(value) => onChange('problemStatement', value)}
        placeholder="What problem would this feature solve?"
        guidance="What problem would this feature solve?"
        required
        minLength={20}
        rows={4}
        error={errors?.problemStatement}
      />

      <GuidanceTextarea
        label="Proposed solution"
        value={fields.proposedSolution || ''}
        onChange={(value) => onChange('proposedSolution', value)}
        placeholder="How would you envision this working?"
        guidance="How would you envision this working?"
        required
        minLength={20}
        rows={4}
        error={errors?.proposedSolution}
      />

      <GuidanceTextarea
        label="Use case details"
        value={fields.useCaseDetails || ''}
        onChange={(value) => onChange('useCaseDetails', value)}
        placeholder="Any additional context about your use case..."
        guidance="Are there workarounds you're using now?"
        required={false}
        rows={3}
      />

      <div className="space-y-2">
        <Label
          htmlFor="priorityContext"
          className="text-sm font-medium text-foreground"
        >
          How important is this?
        </Label>
        <Select
          value={fields.priorityContext || ''}
          onValueChange={(value) => onChange('priorityContext', value)}
        >
          <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
            <SelectValue placeholder="Select importance level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nice_to_have">Nice to have</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create remaining templates (account, technical, billing, other)**

Create similar template components for:

- `account-issue-template.tsx`
- `technical-support-template.tsx`
- `billing-inquiry-template.tsx`
- `other-inquiry-template.tsx`

Each follows the same pattern as BugReportTemplate, with appropriate fields from the template config.

- [ ] **Step 4: Create smart form container component**

```typescript
// apps/naiera-support/app/support/tickets/new/components/smart-ticket-form.tsx

'use client'

import { TicketType, getTicketTypeConfig } from '@/lib/ticketing/ticket-types'
import { SubjectInput } from './form-fields/subject-input'
import { PrioritySelect } from './form-fields/priority-select'
import { RequesterInfo } from './form-fields/requester-info'
import { AttachmentUpload } from '@/components/ticketing/attachment-upload'
import type { AttachmentFile } from '@/components/ticketing/attachment-upload'
import { Button } from '@workspace/ui/components/button'
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { BugReportTemplate } from './form-templates/bug-report-template'
import { FeatureRequestTemplate } from './form-templates/feature-request-template'
import { AccountIssueTemplate } from './form-templates/account-issue-template'
import { TechnicalSupportTemplate } from './form-templates/technical-support-template'
import { BillingInquiryTemplate } from './form-templates/billing-inquiry-template'
import { OtherInquiryTemplate } from './form-templates/other-inquiry-template'
import type { AttachmentFile as AttachmentFileType } from '@/components/ticketing/attachment-upload'

interface SmartTicketFormProps {
  ticketType: TicketType
  subject: string
  templateFields: Record<string, string>
  priority: string
  requesterInfo: {
    name: string
    email: string
    phone: string
  }
  attachments: AttachmentFileType[]
  onChangeSubject: (value: string) => void
  onChangeTemplateField: (field: string, value: string) => void
  onChangePriority: (value: string) => void
  onChangeRequesterInfo: (
    field: 'name' | 'email' | 'phone',
    value: string
  ) => void
  onChangeAttachments: (files: AttachmentFileType[]) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting: boolean
  errors?: {
    subject?: string
    templateFields?: Record<string, string>
    requesterInfo?: {
      name?: string
      email?: string
      phone?: string
    }
  }
  tokenParam?: string
  tokenValid?: boolean
  tokenData?: {
    email?: string
    externalUserId?: string
  }
}

export function SmartTicketForm({
  ticketType,
  subject,
  templateFields,
  priority,
  requesterInfo,
  attachments,
  onChangeSubject,
  onChangeTemplateField,
  onChangePriority,
  onChangeRequesterInfo,
  onChangeAttachments,
  onSubmit,
  onBack,
  isSubmitting,
  errors,
  tokenParam,
  tokenValid,
  tokenData,
}: SmartTicketFormProps) {
  const config = getTicketTypeConfig(ticketType)
  const subjectPrefix = {
    [TicketType.BUG_REPORT]: 'Bug',
    [TicketType.FEATURE_REQUEST]: 'Feature',
    [TicketType.ACCOUNT_ISSUE]: 'Account',
    [TicketType.TECHNICAL_SUPPORT]: 'Support',
    [TicketType.BILLING_INQUIRY]: 'Billing',
    [TicketType.OTHER_INQUIRY]: '',
  }[ticketType]

  const renderTemplate = () => {
    switch (ticketType) {
      case TicketType.BUG_REPORT:
        return (
          <BugReportTemplate
            fields={templateFields}
            onChange={onChangeTemplateField}
            errors={errors?.templateFields}
          />
        )
      case TicketType.FEATURE_REQUEST:
        return (
          <FeatureRequestTemplate
            fields={templateFields}
            onChange={onChangeTemplateField}
            errors={errors?.templateFields}
          />
        )
      case TicketType.ACCOUNT_ISSUE:
        return (
          <AccountIssueTemplate
            fields={templateFields}
            onChange={onChangeTemplateField}
            errors={errors?.templateFields}
          />
        )
      case TicketType.TECHNICAL_SUPPORT:
        return (
          <TechnicalSupportTemplate
            fields={templateFields}
            onChange={onChangeTemplateField}
            errors={errors?.templateFields}
          />
        )
      case TicketType.BILLING_INQUIRY:
        return (
          <BillingInquiryTemplate
            fields={templateFields}
            onChange={onChangeTemplateField}
            errors={errors?.templateFields}
          />
        )
      case TicketType.OTHER_INQUIRY:
        return (
          <OtherInquiryTemplate
            fields={templateFields}
            onChange={onChangeTemplateField}
            errors={errors?.templateFields}
          />
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Change ticket type
      </button>

      {/* Type-specific header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {config.label}
        </h2>
        <p className="text-base leading-7 text-muted-foreground">
          {config.description}
        </p>
      </div>

      {/* Contextual questions */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 dark:bg-primary/10">
        <p className="text-sm font-medium text-primary mb-2">
          Help us help you faster:
        </p>
        <ul className="space-y-1">
          {config.contextualQuestions.map((question, index) => (
            <li
              key={index}
              className="text-sm text-primary/90 flex items-start gap-2"
            >
              <span className="text-primary/60 mt-0.5">•</span>
              {question}
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
        {/* Subject */}
        <SubjectInput
          value={subject}
          onChange={onChangeSubject}
          prefix={subjectPrefix}
          error={errors?.subject}
        />

        <div className="border-t border-border/60" />

        {/* Template fields */}
        <section className="space-y-5">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Details
          </h3>
          {renderTemplate()}
        </section>

        <div className="border-t border-border/60" />

        {/* Priority */}
        <PrioritySelect
          value={priority as any}
          onChange={onChangePriority}
        />

        <div className="border-t border-border/60" />

        {/* Requester info */}
        <section className="space-y-5">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Your Information
          </h3>
          <RequesterInfo
            name={requesterInfo.name}
            email={requesterInfo.email}
            phone={requesterInfo.phone}
            onChangeRequesterInfo={onChangeRequesterInfo}
            emailLocked={tokenValid}
            tokenValid={tokenValid}
            externalUserId={tokenData?.externalUserId}
            errors={errors?.requesterInfo}
          />
        </section>

        <div className="border-t border-border/60" />

        {/* Attachments */}
        <section className="space-y-5">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Attachments
          </h3>
          <AttachmentUpload
            maxFiles={3}
            value={attachments}
            onFilesChange={onChangeAttachments}
            uploadEndpoint="ticket-attachment"
            token={tokenParam}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Max 3 files, 5MB each. Images: JPG, PNG, GIF, WebP. Docs: PDF,
            DOC, DOCX, XLS, XLSX.
          </p>
        </section>

        <div className="border-t border-border/60" />

        {/* Submit */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="submit"
            className="h-11 w-full rounded-2xl px-5 sm:w-auto sm:min-w-44"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit {config.label}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
```

- [ ] **Step 5: Type check smart form**

Run: `pnpm typecheck --filter naiera-support`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/naiera-support/app/support/tickets/new/components/
git commit -m "feat(ticket-form): add smart form with type-specific templates

Implement 6 ticket type templates with contextual questions and
fields. Create SmartTicketForm container component that renders
appropriate template based on selected type."
```

---

## Task 5: Integrate Components and Update Page

**Files:**

- Modify: `apps/naiera-support/app/support/tickets/new/page.tsx`

- [ ] **Step 1: Update page.tsx to use new components**

```typescript
// apps/naiera-support/app/support/tickets/new/page.tsx

"use client"

import {
  useState,
  Suspense,
  type FormEvent,
  type ReactNode,
} from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TicketType, getTicketTypeConfig } from "@/lib/ticketing/ticket-types"
import { TicketTypeSelector } from "./components/ticket-type-selector"
import { SmartTicketForm } from "./components/smart-ticket-form"
import { SuccessState } from "./components/success-state"
import { LoadingState } from "./components/loading-state"
import type { AttachmentFile } from "@/components/ticketing/attachment-upload"

interface TokenData {
  email?: string
  externalUserId?: string
  channelSlug: string
  appId: string
}

type AppInfo = {
  name?: string
  slug?: string
}

function TicketForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appSlug = searchParams.get("app")
  const channelParam = searchParams.get("channel")
  const embed = searchParams.get("embed") === "true"
  const tokenParam = searchParams.get("token")

  // Form state
  const [selectedType, setSelectedType] = useState<TicketType | null>(null)
  const [subject, setSubject] = useState("")
  const [templateFields, setTemplateFields] = useState<Record<string, string>>({})
  const [priority, setPriority] = useState("NORMAL")
  const [requesterInfo, setRequesterInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [attachments, setAttachments] = useState<AttachmentFile[]>([])

  // UI state
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [appLoading, setAppLoading] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    subject?: string
    templateFields?: Record<string, string>
    requesterInfo?: {
      name?: string
      email?: string
      phone?: string
    }
  }>({})

  // Validate token and get app info (existing logic)
  useEffect(() => {
    const validateTokenAndGetInfo = async () => {
      if (!tokenParam) return

      try {
        const res = await fetch("/api/integrated/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenParam }),
        })

        if (res.ok) {
          const data = await res.json()
          setTokenData(data)
          setTokenValid(true)

          if (data.email) {
            setRequesterInfo(prev => ({ ...prev, email: data.email }))
          }
        } else {
          const data = await res.json()
          setError(data.message || "Invalid or expired access token")
        }
      } catch (err) {
        console.error("Token validation error:", err)
        setError("Failed to validate access token")
      }
    }

    validateTokenAndGetInfo()
  }, [tokenParam])

  useEffect(() => {
    if (appSlug) {
      fetch(`/api/apps/by-slug/${appSlug}`)
        .then((res) => {
          if (!res.ok) throw new Error("App not found")
          return res.json()
        })
        .then((data) => {
          setAppInfo(data)
        })
        .catch(() => {
          setError("App not found or inactive")
        })
        .finally(() => {
          setAppLoading(false)
        })
    } else {
      setAppLoading(false)
    }
  }, [appSlug])

  // Handle type selection
  const handleTypeSelect = (type: TicketType) => {
    setSelectedType(type)
    const config = getTicketTypeConfig(type)
    setPriority(config.defaultPriority)

    // Clear previous template fields
    setTemplateFields({})
    setSubject("")
    setValidationErrors({})

    // Scroll to form
    setTimeout(() => {
      document.getElementById('ticket-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Handle form submission
  const handleSubmit = async () => {
    setError(null)
    setValidationErrors({})

    // Validate
    const errors: typeof validationErrors = {}

    if (!subject || subject.length < 5) {
      errors.subject = "Subject must be at least 5 characters"
    }

    if (!requesterInfo.email) {
      errors.requesterInfo = { ...errors.requesterInfo, email: "Email is required" }
    }

    // Validate required template fields
    if (selectedType) {
      const config = getTicketTypeConfig(selectedType)
      const templateErrors: Record<string, string> = {}

      config.fields.forEach(field => {
        if (field.required && (!templateFields[field.name] || templateFields[field.name].length < (field.minLength || 0))) {
          templateErrors[field.name] = `${field.label} is required and must be at least ${field.minLength || 0} characters`
        }
      })

      if (Object.keys(templateErrors).length > 0) {
        errors.templateFields = templateErrors
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setLoading(true)

    const attachmentMetadata = attachments
      .filter((a) => a.uploadedUrl)
      .map((a) => ({
        url: a.uploadedUrl!,
        name: a.file.name,
        type: a.file.type,
        size: a.file.size,
      }))

    try {
      const res = await fetch("/api/public/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenParam,
          appSlug,
          channelType: tokenValid ? undefined : "WEB_FORM",
          ticketType: selectedType,
          subject,
          message: buildMessageFromTemplate(selectedType, templateFields),
          priority,
          guestEmail: requesterInfo.email || undefined,
          guestName: requesterInfo.name || undefined,
          guestPhone: requesterInfo.phone || undefined,
          attachments: attachmentMetadata.length > 0 ? attachmentMetadata : undefined,
          metadata: {
            templateFields,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to create ticket")
      }

      setCreatedTicketId(data.id)
      setSubmitted(true)

      if (tokenValid && tokenParam && data.id) {
        router.push(`/support/tickets/${data.id}?token=${tokenParam}`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const buildMessageFromTemplate = (type: TicketType | null, fields: Record<string, string>): string => {
    if (!type) return ""

    const config = getTicketTypeConfig(type)
    let message = ""

    config.fields.forEach(field => {
      if (fields[field.name]) {
        message += `**${field.label}:**\n${fields[field.name]}\n\n`
      }
    })

    return message.trim()
  }

  const resetForm = () => {
    setSelectedType(null)
    setSubject("")
    setTemplateFields({})
    setPriority("NORMAL")
    setRequesterInfo({ name: "", email: tokenData?.email || "", phone: "" })
    setAttachments([])
    setSubmitted(false)
    setCreatedTicketId(null)
    setError(null)
    setValidationErrors({})
  }

  if (appLoading) {
    return <LoadingState embed={embed} />
  }

  if (!appSlug) {
    return (
      <PageStateShell embed={embed}>
        <div className="mx-auto max-w-3xl rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
          <p className="text-center text-destructive">
            Missing app parameter. Open this page with a URL like{' '}
            <span className="font-medium">?app=your-app-slug</span>.
          </p>
        </div>
      </PageStateShell>
    )
  }

  if (appSlug && !appInfo && !error) {
    return (
      <PageStateShell embed={embed}>
        <div className="mx-auto max-w-3xl rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
          <p className="text-center text-destructive">
            App not found or inactive. Please check the URL and try again.
          </p>
        </div>
      </PageStateShell>
    )
  }

  if (submitted && tokenValid && tokenParam && createdTicketId) {
    return <LoadingState embed={embed} />
  }

  if (submitted && !tokenValid) {
    return (
      <SuccessState
        ticketId={createdTicketId || ""}
        appLabel={appInfo?.name || appSlug || "the app"}
        channelLabel={tokenData?.channelSlug || channelParam || "the default channel"}
        onReset={resetForm}
      />
    )
  }

  return (
    <PageStateShell embed={embed}>
      {!embed && (
        <header className="mx-auto max-w-3xl space-y-4 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Create Support Ticket
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {appInfo
              ? `Get help with ${appInfo.name}. Select your issue type below and we'll guide you through providing the right information.`
              : "Select your issue type below and we'll guide you through providing the right information."}
          </p>
        </header>
      )}

      {error && (
        <div className="mx-auto max-w-3xl mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!selectedType ? (
        <TicketTypeSelector
          selectedType={selectedType}
          onSelectType={handleTypeSelect}
        />
      ) : (
        <div id="ticket-form" className="mx-auto max-w-3xl">
          <SmartTicketForm
            ticketType={selectedType}
            subject={subject}
            templateFields={templateFields}
            priority={priority}
            requesterInfo={requesterInfo}
            attachments={attachments}
            onChangeSubject={setSubject}
            onChangeTemplateField={(field, value) =>
              setTemplateFields(prev => ({ ...prev, [field]: value }))
            }
            onChangePriority={setPriority}
            onChangeRequesterInfo={(field, value) =>
              setRequesterInfo(prev => ({ ...prev, [field]: value }))
            }
            onChangeAttachments={setAttachments}
            onSubmit={handleSubmit}
            onBack={() => setSelectedType(null)}
            isSubmitting={loading}
            errors={validationErrors}
            tokenParam={tokenParam || undefined}
            tokenValid={tokenValid}
            tokenData={tokenData}
          />
        </div>
      )}
    </PageStateShell>
  )
}

function PageStateShell({
  children,
  embed,
}: {
  children: ReactNode
  embed: boolean
}) {
  return (
    <div
      className={
        "relative min-h-screen overflow-hidden bg-background" +
        (!embed && " px-4 py-6 sm:px-6 sm:py-8 lg:px-8")
      }
    >
      <div className={"mx-auto w-full" + (embed ? " max-w-3xl" : " max-w-6xl")}>
        {children}
      </div>
    </div>
  )
}

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <TicketForm />
    </Suspense>
  )
}
```

- [ ] **Step 2: Create success state component**

```typescript
// apps/naiera-support/app/support/tickets/new/components/success-state.tsx

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { CheckCircle2 } from 'lucide-react'
import { MetaRow } from './meta-row'

interface SuccessStateProps {
  ticketId: string
  appLabel: string
  channelLabel: string
  onReset: () => void
}

export function SuccessState({
  ticketId,
  appLabel,
  channelLabel,
  onReset,
}: SuccessStateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="mx-auto w-full max-w-lg border-border/70 bg-card/95 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
        <CardHeader className="space-y-4 border-b border-border/60 bg-muted/20 p-6 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">
              Ticket Created Successfully
            </CardTitle>
            <CardDescription className="max-w-md">
              Your ticket has been created and is being processed.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div className="space-y-3">
            <MetaRow label="App" value={appLabel} />
            <MetaRow label="Channel" value={channelLabel} />
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
              Ticket number
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {ticketId}
            </p>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            We have sent a confirmation email with your ticket details. Use
            the ticket number to track progress later.
          </p>

          <Button onClick={onReset} className="w-full">
            Create Another Ticket
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Create meta-row utility component**

```typescript
// apps/naiera-support/app/support/tickets/new/components/meta-row.tsx

'use client'

interface MetaRowProps {
  label: string
  value: string
}

export function MetaRow({ label, value }: MetaRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}
```

- [ ] **Step 4: Update loading state component**

Modify existing loading-state.tsx to remove excessive visual elements and keep it minimal.

- [ ] **Step 5: Type check page integration**

Run: `pnpm typecheck --filter naiera-support`
Expected: PASS

- [ ] **Step 6: Test the flow in dev server**

Run: `pnpm dev --filter naiera-support`
Expected:

1. Type selector displays
2. Click type → form appears
3. Fill form → validation works
4. Submit → creates ticket
5. Success state displays

- [ ] **Step 7: Commit**

```bash
git add apps/naiera-support/app/support/tickets/new/
git commit -m "feat(ticket-form): integrate components and update page

Wire up TicketTypeSelector and SmartTicketForm in page.tsx.
Add state management, validation, and submission logic.
Create SuccessState and update LoadingState components."
```

---

## Task 6: Update API Route to Accept Template Data

**Files:**

- Modify: `apps/naiera-support/app/api/public/tickets/route.ts`

- [ ] **Step 1: Update API route to handle ticketType and templateFields**

```typescript
// apps/naiera-support/app/api/public/tickets/route.ts

// Add to existing ticket creation logic:

// In the POST handler, after validating other fields:
if (ticketType) {
  // Store ticket type in metadata or as a field
  ticketData.metadata = {
    ...ticketData.metadata,
    ticketType,
    templateFields: metadata?.templateFields || {},
  }
}

// The message field is already constructed from templateFields
// by the frontend, so no changes needed there.
```

- [ ] **Step 2: Test API with new fields**

Run: `curl -X POST http://localhost:3000/api/public/tickets -d '{"ticketType":"BUG_REPORT",...}'`
Expected: Ticket created with type and template data in metadata

- [ ] **Step 3: Commit**

```bash
git add apps/naiera-support/app/api/public/tickets/route.ts
git commit -m "feat(api): accept ticketType and templateFields in ticket creation

Extend ticket creation API to accept structured template data
and store it in ticket metadata for better triage and analysis."
```

---

## Task 7: Add Mobile Responsive Styles

**Files:**

- Modify: `apps/naiera-support/app/support/tickets/new/components/ticket-type-selector.tsx`
- Modify: `apps/naiera-support/app/support/tickets/new/components/smart-ticket-form.tsx`

- [ ] **Step 1: Ensure mobile responsiveness in type selector**

Verify grid breakpoints are correct:

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

- [ ] **Step 2: Add mobile-specific styles to smart form**

- Sticky header with "Change type" button on mobile
- Collapsible contextual questions on mobile
- Sticky submit button at bottom on mobile

- [ ] **Step 3: Test on mobile viewport**

Run: `pnpm dev --filter naiera-support`
Open DevTools, toggle device toolbar, test at 375px width

- [ ] **Step 4: Commit**

```bash
git add apps/naiera-support/app/support/tickets/new/components/
git commit -m "style(ticket-form): add mobile responsive enhancements

Add sticky headers, collapsible sections, and touch-optimized
styles for mobile devices. Ensure all interactive elements
meet 44px minimum touch target size."
```

---

## Task 8: Add Animations and Transitions

**Files:**

- Modify: `apps/naiera-support/app/support/tickets/new/components/ticket-type-selector.tsx`
- Modify: `apps/naiera-support/app/support/tickets/new/components/smart-ticket-form.tsx`

- [ ] **Step 1: Add smooth page transitions**

Enhance framer-motion animations:

- Type card hover: scale 1.02
- Type selection: smooth border color transition
- Form appearance: fade + slide from bottom (300ms)

- [ ] **Step 2: Add micro-interactions**

- Button press: scale down slightly
- Input focus: border color transition
- Success state: subtle confetti or checkmark animation

- [ ] **Step 3: Test animations feel smooth**

Run: `pnpm dev --filter naiera-support`
Verify no jank, animations feel natural

- [ ] **Step 4: Commit**

```bash
git add apps/naiera-support/app/support/tickets/new/components/
git commit -m "ui(ticket-form): add smooth animations and micro-interactions

Implement framer-motion animations for type selection and form
transitions. Add hover, focus, and success state animations."
```

---

## Task 9: Write Tests

**Files:**

- Create: `apps/naiera-support/app/support/tickets/new/components/__tests__/ticket-type-selector.test.tsx`
- Create: `apps/naiera-support/app/support/tickets/new/components/__tests__/smart-ticket-form.test.tsx`

- [ ] **Step 1: Write tests for type selector**

```typescript
// apps/naiera-support/app/support/tickets/new/components/__tests__/ticket-type-selector.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import { TicketTypeSelector } from '../ticket-type-selector'
import { TicketType } from '@/lib/ticketing/ticket-types'

describe('TicketTypeSelector', () => {
  it('renders 6 ticket type cards', () => {
    render(
      <TicketTypeSelector
        selectedType={null}
        onSelectType={() => {}}
      />
    )

    expect(screen.getByText('Bug Report')).toBeInTheDocument()
    expect(screen.getByText('Feature Request')).toBeInTheDocument()
    expect(screen.getByText('Account Issue')).toBeInTheDocument()
    expect(screen.getByText('Technical Support')).toBeInTheDocument()
    expect(screen.getByText('Billing Inquiry')).toBeInTheDocument()
    expect(screen.getByText('Other Inquiry')).toBeInTheDocument()
  })

  it('calls onSelectType when a type is clicked', () => {
    const onSelectType = jest.fn()
    render(
      <TicketTypeSelector
        selectedType={null}
        onSelectType={onSelectType}
      />
    )

    fireEvent.click(screen.getByText('Bug Report'))
    expect(onSelectType).toHaveBeenCalledWith(TicketType.BUG_REPORT)
  })

  it('highlights selected type', () => {
    render(
      <TicketTypeSelector
        selectedType={TicketType.BUG_REPORT}
        onSelectType={() => {}}
      />
    )

    const bugCard = screen.getByText('Bug Report').closest('button')
    expect(bugCard).toHaveClass('border-primary')
  })
})
```

- [ ] **Step 2: Write tests for smart form**

```typescript
// apps/naiera-support/app/support/tickets/new/components/__tests__/smart-ticket-form.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import { SmartTicketForm } from '../smart-ticket-form'
import { TicketType } from '@/lib/ticketing/ticket-types'

describe('SmartTicketForm', () => {
  it('renders bug report template', () => {
    render(
      <SmartTicketForm
        ticketType={TicketType.BUG_REPORT}
        subject=""
        templateFields={{}}
        priority="NORMAL"
        requesterInfo={{ name: '', email: '', phone: '' }}
        attachments={[]}
        onChangeSubject={() => {}}
        onChangeTemplateField={() => {}}
        onChangePriority={() => {}}
        onChangeRequesterInfo={() => {}}
        onChangeAttachments={() => {}}
        onSubmit={() => {}}
        onBack={() => {}}
        isSubmitting={false}
      />
    )

    expect(screen.getByText('Steps to reproduce')).toBeInTheDocument()
    expect(screen.getByText('Expected behavior')).toBeInTheDocument()
    expect(screen.getByText('Actual behavior')).toBeInTheDocument()
  })

  it('shows validation errors', () => {
    render(
      <SmartTicketForm
        ticketType={TicketType.BUG_REPORT}
        subject=""
        templateFields={{}}
        priority="NORMAL"
        requesterInfo={{ name: '', email: '', phone: '' }}
        attachments={[]}
        onChangeSubject={() => {}}
        onChangeTemplateField={() => {}}
        onChangePriority={() => {}}
        onChangeRequesterInfo={() => {}}
        onChangeAttachments={() => {}}
        onSubmit={() => {}}
        onBack={() => {}}
        isSubmitting={false}
        errors={{
          subject: 'Subject is required',
          templateFields: {
            stepsToReproduce: 'This field is required',
          },
        }}
      />
    )

    expect(screen.getByText('Subject is required')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests**

Run: `pnpm test --filter naiera-support`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add apps/naiera-support/app/support/tickets/new/components/__tests__/
git commit -m "test(ticket-form): add unit tests for type selector and smart form

Add tests for component rendering, user interactions, and
validation error display."
```

---

## Task 10: Final Integration Testing and Polish

**Files:**

- Multiple files for final polish

- [ ] **Step 1: Manual testing checklist**

Run: `pnpm dev --filter naiera-support`

Test the following scenarios:

- [ ] All 6 ticket types render correctly
- [ ] Type selection works and form appears
- [ ] Form validation shows appropriate errors
- [ ] File upload works (up to 3 files)
- [ ] Submit creates ticket successfully
- [ ] Success state displays with ticket ID
- [ ] "Create another ticket" resets form
- [ ] Token-based authentication works
- [ ] Mobile responsive at 375px width
- [ ] Animations are smooth
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces changes appropriately

- [ ] **Step 2: Cross-browser testing**

Test in:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

- [ ] **Step 3: Performance check**

Run Lighthouse audit:

- Performance score >90
- Accessibility score >90
- Best practices score >90

- [ ] **Step 4: Fix any issues found**

Address bugs, visual glitches, or accessibility issues discovered during testing.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore(ticket-form): final polish and bug fixes

Address issues found during integration testing. Improve
accessibility, performance, and cross-browser compatibility.
Ready for production use."
```

---

## Task 11: Update Documentation

**Files:**

- Create: `apps/naiera-support/docs/support/ticket-creation.md` (optional)

- [ ] **Step 1: Create usage documentation**

Document:

- How to embed the ticket form in other apps
- URL parameters (?app=, ?channel=, ?token=, ?embed=)
- Ticket type definitions
- Customization options

- [ ] **Step 2: Add comments to complex code**

Add inline comments explaining:

- Template configuration structure
- Form state management
- Validation logic
- API integration

- [ ] **Step 3: Commit documentation**

```bash
git add apps/naiera-support/docs/
git add apps/naiera-support/app/support/tickets/new/
git commit -m "docs(ticket-form): add usage documentation and code comments

Document how to use and customize the ticket creation form.
Add inline comments to complex sections for maintainability."
```

---

## Task 12: Create Feature Flag and Gradual Rollout

**Files:**

- Modify: `apps/naiera-support/lib/feature-flags.ts` (create if needed)
- Modify: `apps/naiera-support/app/support/tickets/new/page.tsx`

- [ ] **Step 1: Add feature flag**

```typescript
// apps/naiera-support/lib/feature-flags.ts

export const FEATURE_FLAGS = {
  NEW_TICKET_FORM: process.env.FEATURE_FLAG_NEW_TICKET_FORM === "true",
}
```

- [ ] **Step 2: Update page to use feature flag**

```typescript
// apps/naiera-support/app/support/tickets/new/page.tsx

import { FEATURE_FLAGS } from '@/lib/feature-flags'

// In TicketForm component, add conditional:
if (!FEATURE_FLAGS.NEW_TICKET_FORM) {
  // Render old form
  return <OldTicketForm />
}

// Render new form (existing code)
return (
  // ... new form code
)
```

- [ ] **Step 3: Test feature flag works**

Run: `FEATURE_FLAG_NEW_TICKET_FORM=false pnpm dev --filter naiera-support`
Expected: Old form renders

Run: `FEATURE_FLAG_NEW_TICKET_FORM=true pnpm dev --filter naiera-support`
Expected: New form renders

- [ ] **Step 4: Commit feature flag**

```bash
git add apps/naiera-support/lib/feature-flags.ts
git add apps/naiera-support/app/support/tickets/new/page.tsx
git commit -m "feat(ticket-form): add feature flag for gradual rollout

Add FEATURE_FLAG_NEW_TICKET_FORM to control new form rollout.
Allows instant rollback if issues arise in production."
```

---

## Completion Checklist

After all tasks are complete:

- [ ] All 6 ticket type templates implemented
- [ ] Form validation working for all fields
- [ ] Mobile responsive at 375px breakpoint
- [ ] Animations smooth and performant
- [ ] Accessibility (WCAG AA) verified
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Performance audit passing (>90 scores)
- [ ] Feature flag implemented
- [ ] Documentation complete
- [ ] Code reviewed and committed

---

## Success Metrics

Track these metrics after launch:

1. **Form completion rate**: >90% (baseline from current implementation)
2. **Time to submit**: <2 minutes average
3. **Mobile usage share**: >40% of submissions
4. **"Need more info" responses**: <5% of created tickets
5. **User satisfaction**: >4.0/5.0 in post-submission survey

---

## Rollback Plan

If critical issues are discovered:

1. Set `FEATURE_FLAG_NEW_TICKET_FORM=false` in environment
2. Deploy feature flag change
3. Users see old form within minutes
4. Fix issues in new form
5. Set `FEATURE_FLAG_NEW_TICKET_FORM=true` when ready

No database changes required for rollback.
