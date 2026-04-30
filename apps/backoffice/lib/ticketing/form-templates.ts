import { TicketType, type TicketTypeConfig } from "./ticket-types"

export const TICKET_TYPE_CONFIGS: Record<TicketType, TicketTypeConfig> = {
  [TicketType.BUG_REPORT]: {
    id: TicketType.BUG_REPORT,
    label: "Bug Report",
    icon: "bug",
    description: "Report a technical issue or unexpected behavior",
    examples: [
      "Application crashes when I try to export data",
      "Button click doesn't respond on mobile devices",
      "Error message appears when saving settings",
    ],
    defaultPriority: "HIGH",
    fields: [
      {
        name: "steps",
        label: "Steps to Reproduce",
        type: "textarea",
        required: true,
        placeholder: "Describe the exact steps to reproduce this bug...",
        rows: 4,
      },
      {
        name: "expectedBehavior",
        label: "Expected Behavior",
        type: "textarea",
        required: true,
        placeholder: "What did you expect to happen?",
        rows: 2,
      },
      {
        name: "actualBehavior",
        label: "Actual Behavior",
        type: "textarea",
        required: true,
        placeholder: "What actually happened?",
        rows: 2,
      },
      {
        name: "browser",
        label: "Browser/Environment",
        type: "text",
        required: false,
        placeholder: "e.g., Chrome 120, Safari 17.2, Firefox 121",
      },
      {
        name: "severity",
        label: "Severity",
        type: "select",
        required: true,
        options: [
          { value: "low", label: "Low - Minor annoyance" },
          { value: "medium", label: "Medium - Affects workflow" },
          { value: "high", label: "High - Blocking critical functionality" },
          { value: "critical", label: "Critical - System unusable" },
        ],
      },
    ],
    contextualQuestions: [
      "Can you reproduce this issue consistently?",
      "Does this happen on specific devices or browsers?",
      "Were there any recent changes before this started?",
    ],
  },

  [TicketType.FEATURE_REQUEST]: {
    id: TicketType.FEATURE_REQUEST,
    label: "Feature Request",
    icon: "lightbulb",
    description: "Suggest a new feature or enhancement",
    examples: [
      "Add dark mode support to the dashboard",
      "Allow exporting reports as PDF",
      "Integrate with Slack notifications",
    ],
    defaultPriority: "NORMAL",
    fields: [
      {
        name: "problemStatement",
        label: "Problem Statement",
        type: "textarea",
        required: true,
        placeholder: "What problem would this feature solve?",
        rows: 3,
      },
      {
        name: "proposedSolution",
        label: "Proposed Solution",
        type: "textarea",
        required: true,
        placeholder: "Describe your ideal solution...",
        rows: 3,
      },
      {
        name: "useCase",
        label: "Use Case",
        type: "textarea",
        required: true,
        placeholder:
          "How would you use this feature? Provide specific examples...",
        rows: 3,
      },
      {
        name: "alternatives",
        label: "Alternative Solutions",
        type: "textarea",
        required: false,
        placeholder: "Have you considered other workarounds?",
        rows: 2,
      },
      {
        name: "priority",
        label: "Priority to You",
        type: "select",
        required: true,
        options: [
          { value: "nice_to_have", label: "Nice to have" },
          { value: "important", label: "Important" },
          { value: "critical", label: "Critical for my workflow" },
        ],
      },
    ],
    contextualQuestions: [
      "How frequently would you use this feature?",
      "Would this benefit other users in your organization?",
      "Are there any existing features that could be extended?",
    ],
  },

  [TicketType.ACCOUNT_ISSUE]: {
    id: TicketType.ACCOUNT_ISSUE,
    label: "Account Issue",
    icon: "user-cog",
    description: "Problems with your account, access, or settings",
    examples: [
      "Unable to reset my password",
      "Need to update email address",
      "Can't access my account after role change",
    ],
    defaultPriority: "HIGH",
    fields: [
      {
        name: "accountType",
        label: "Account Type",
        type: "select",
        required: true,
        options: [
          { value: "personal", label: "Personal Account" },
          { value: "organization", label: "Organization Account" },
          { value: "team", label: "Team Account" },
        ],
      },
      {
        name: "issueType",
        label: "Issue Type",
        type: "select",
        required: true,
        options: [
          { value: "access", label: "Access/Login Problem" },
          { value: "settings", label: "Settings/Profile" },
          { value: "permissions", label: "Permissions/Roles" },
          { value: "billing", label: "Billing/Subscription" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "affectedUsers",
        label: "Affected Users",
        type: "text",
        required: false,
        placeholder: "Just you or multiple users?",
      },
      {
        name: "recentChanges",
        label: "Recent Changes",
        type: "textarea",
        required: false,
        placeholder: "Any recent changes to your account or organization?",
        rows: 2,
      },
      {
        name: "urgency",
        label: "Urgency",
        type: "select",
        required: true,
        options: [
          { value: "low", label: "Low - Can wait a few days" },
          { value: "medium", label: "Medium - Affecting productivity" },
          { value: "high", label: "High - Completely blocked" },
        ],
      },
    ],
    contextualQuestions: [
      "When did this issue first occur?",
      "Have you tried any troubleshooting steps?",
      "Is this a new account or existing account?",
    ],
  },

  [TicketType.TECHNICAL_SUPPORT]: {
    id: TicketType.TECHNICAL_SUPPORT,
    label: "Technical Support",
    icon: "wrench",
    description: "Get help with technical questions and configuration",
    examples: [
      "Need help setting up API integration",
      "Question about data export formats",
      "Assistance with webhook configuration",
    ],
    defaultPriority: "NORMAL",
    fields: [
      {
        name: "topic",
        label: "Support Topic",
        type: "select",
        required: true,
        options: [
          { value: "integration", label: "API Integration" },
          { value: "configuration", label: "Configuration/Setup" },
          { value: "data", label: "Data Management" },
          { value: "performance", label: "Performance" },
          { value: "security", label: "Security/Authentication" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "environment",
        label: "Environment",
        type: "text",
        required: false,
        placeholder: "e.g., Production, Staging, Development",
      },
      {
        name: "question",
        label: "Your Question",
        type: "textarea",
        required: true,
        placeholder: "Describe what you need help with...",
        rows: 4,
      },
      {
        name: "currentSetup",
        label: "Current Setup",
        type: "textarea",
        required: false,
        placeholder:
          "Share relevant details about your current configuration...",
        rows: 3,
      },
      {
        name: "errorMessages",
        label: "Error Messages",
        type: "textarea",
        required: false,
        placeholder: "Paste any error messages you're seeing...",
        rows: 2,
      },
    ],
    contextualQuestions: [
      "Is this blocking your deployment or development?",
      "Have you checked our documentation for this topic?",
      "Are there specific error messages or logs you can share?",
    ],
  },

  [TicketType.BILLING_INQUIRY]: {
    id: TicketType.BILLING_INQUIRY,
    label: "Billing Inquiry",
    icon: "credit-card",
    description: "Questions about billing, invoices, or subscriptions",
    examples: [
      "Question about recent charge",
      "Need to update payment method",
      "Request for refund",
    ],
    defaultPriority: "NORMAL",
    fields: [
      {
        name: "inquiryType",
        label: "Inquiry Type",
        type: "select",
        required: true,
        options: [
          { value: "charge_question", label: "Question About Charge" },
          { value: "payment_method", label: "Update Payment Method" },
          { value: "refund", label: "Refund Request" },
          { value: "subscription", label: "Subscription Change" },
          { value: "invoice", label: "Invoice Issue" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "invoiceNumber",
        label: "Invoice Number",
        type: "text",
        required: false,
        placeholder: "If applicable, provide invoice number",
      },
      {
        name: "amount",
        label: "Amount",
        type: "text",
        required: false,
        placeholder: "Amount in question (optional)",
      },
      {
        name: "details",
        label: "Details",
        type: "textarea",
        required: true,
        placeholder: "Please provide details about your inquiry...",
        rows: 4,
      },
      {
        name: "contactPreference",
        label: "Preferred Contact Method",
        type: "select",
        required: true,
        options: [
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
        ],
      },
    ],
    contextualQuestions: [
      "Is this time-sensitive (e.g., upcoming renewal)?",
      "Have you reviewed our pricing page?",
      "Do you have screenshots or documentation to support your inquiry?",
    ],
  },

  [TicketType.OTHER_INQUIRY]: {
    id: TicketType.OTHER_INQUIRY,
    label: "Other Inquiry",
    icon: "message-circle",
    description: "General questions and other inquiries",
    examples: [
      "Partnership opportunity",
      "Feedback about the product",
      "Question not covered by other categories",
    ],
    defaultPriority: "NORMAL",
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [
          { value: "feedback", label: "Product Feedback" },
          { value: "partnership", label: "Partnership Inquiry" },
          { value: "documentation", label: "Documentation Question" },
          { value: "general", label: "General Question" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "message",
        label: "Your Message",
        type: "textarea",
        required: true,
        placeholder: "How can we help you?",
        rows: 6,
      },
      {
        name: "expectedResponse",
        label: "Expected Response Time",
        type: "select",
        required: true,
        options: [
          { value: "standard", label: "Standard response time" },
          { value: "urgent", label: "Urgent - Need response within 24 hours" },
        ],
      },
    ],
    contextualQuestions: [
      "Is there a specific team member who should handle this?",
      "Have you already contacted us through another channel?",
      "Are there any attachments or screenshots that would help?",
    ],
  },
}

/**
 * Get the configuration for a specific ticket type
 */
export function getTicketTypeConfig(
  ticketType: TicketType
): TicketTypeConfig | undefined {
  return TICKET_TYPE_CONFIGS[ticketType]
}

/**
 * Get all available ticket type configurations
 */
export function getAllTicketTypeConfigs(): TicketTypeConfig[] {
  return Object.values(TICKET_TYPE_CONFIGS)
}

/**
 * Get the icon component name for a ticket type
 * Note: This returns the Lucide icon name string
 */
export function getIconComponent(ticketType: TicketType): string {
  const config = getTicketTypeConfig(ticketType)
  return config?.icon || "help-circle"
}
