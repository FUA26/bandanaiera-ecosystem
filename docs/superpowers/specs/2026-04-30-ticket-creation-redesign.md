# Ticket Creation Page Redesign Design Spec

**Date**: 2026-04-30
**Status**: Approved
**Version**: 1.0

## Overview

Redesign the support ticket creation page (`/support/tickets/new`) to address user experience issues with form complexity, unclear expectations, and poor mobile experience. The new design uses a **progressive template-first flow** where users select their ticket type first, then receive a smart, contextual form tailored to that type.

## Goals

1. **Modernize visual design** - Streamlined, minimal, professional aesthetic
2. **Improve user experience** - Reduce form overwhelm and provide clear guidance
3. **Mobile optimization** - Excellent experience on phones and tablets
4. **Reduce support friction** - Users know exactly what information to provide

## Non-Goals

- Complete backend redesign (reuse existing API)
- Multi-language support (out of scope)
- Ticket editing/modification after creation (future feature)

## Current Pain Points

- **Form feels overwhelming** - Too many fields, sections, or text
- **Unclear expectations** - Users don't know what information to provide
- **Poor mobile experience** - Page doesn't work well on phones

## Solution: Progressive Template-First Flow

Users select their ticket type from a visual grid, then receive a smart form with type-specific questions and guidance.

---

## Visual Design

### Design Direction

**Streamlined, minimal, and professional** - Remove visual noise while polishing the existing design language.

**Key changes**:

- Remove: Background gradient blobs, excessive badges, decorative elements
- Keep: Teal/cyan primary, 10px rounded corners, card-based layout
- Enhance: Better whitespace, stronger typography hierarchy, smoother animations

### Typography

| Element         | Size | Weight   | Usage             |
| --------------- | ---- | -------- | ----------------- |
| Page title      | 28px | Semibold | Main heading      |
| Section headers | 18px | Medium   | Form sections     |
| Body text       | 15px | Regular  | Content           |
| Input fields    | 16px | Regular  | Prevents iOS zoom |
| Labels          | 14px | Medium   | Field labels      |

Mobile: Scale base to 16px (iOS preference), reduce spacing to 32px.

### Color Usage

- **Primary action**: Teal/cyan (`bg-primary`)
- **Type cards**: White bg, subtle border, hover adds teal accent
- **Selected type**: Teal border + light teal bg tint
- **Helper text**: Muted-foreground
- **Error states**: Red with soft bg tint

### Spacing

- Section spacing: 48px (desktop), 32px (mobile)
- Card padding: 24px
- Form field gap: 16px
- Button height: 48px (touch target)

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header (minimal)                                       │
│  - Title: "Create Support Ticket"                      │
│  - App context badge (if ?app= param)                  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Step 1: Ticket Type Selection (Hero Section)          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │  Bug   │ │Feature │ │Account │ │Billing │          │
│  │ Report │ │Request │ │ Issue  │ │ Inquiry│          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
│  ┌────────┐ ┌────────┐                                  │
│  │Technical│ │ Other  │                                  │
│  │ Support │ │ Inquiry│                                  │
│  └────────┘ └────────┘                                  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Step 2: Smart Form (appears after type selection)     │
│  - Type-specific guidance/questions                     │
│  - Contextual fields                                    │
│  - Subject + Message (type-aware placeholders)          │
│  - Attachments (streamlined)                            │
│  - Submit button                                        │
└─────────────────────────────────────────────────────────┘
```

---

## Ticket Type Selection System

### The 6 Ticket Types

#### 1. Bug Report 🐛

- **Description**: "Software defects, errors, unexpected behavior"
- **Examples**: "Login, crashes, error messages"
- **Default priority**: Normal
- **Icon**: `bug` (lucide)

#### 2. Feature Request 💡

- **Description**: "New features, enhancements, improvements"
- **Examples**: "New integrations, UI improvements, API additions"
- **Default priority**: Low
- **Icon**: `lightbulb` (lucide)

#### 3. Account Issue 👤

- **Description**: "Login, access, profile, or billing problems"
- **Examples**: "Password reset, permissions, account settings"
- **Default priority**: High
- **Icon**: `user` (lucide)

#### 4. Technical Support 🔧

- **Description**: "Configuration, setup, or technical guidance"
- **Examples**: "API questions, installation, troubleshooting"
- **Default priority**: Normal
- **Icon**: `wrench` (lucide)

#### 5. Billing Inquiry 💳

- **Description**: "Payments, invoices, subscriptions, or refunds"
- **Examples**: "Upgrade, downgrade, payment issues"
- **Default priority**: High
- **Icon**: `credit-card` (lucide)

#### 6. Other Inquiry 💬

- **Description**: "General questions or anything else"
- **Examples**: "Partnership, feedback, general support"
- **Default priority**: Normal
- **Icon**: `message-circle` (lucide)

### Type Card Design

Each card is clickable with:

- Icon (24px)
- Type label (semibold, 16px)
- Description (regular, 14px, muted)
- Example hints (small, 12px, muted)

**States**:

- Default: White bg, subtle border
- Hover: Lift effect, border changes to teal
- Selected: Teal border, light teal bg, checkmark icon
- Focus: Visible focus ring

### Grid Layout

- **Desktop**: 3 columns × 2 rows
- **Tablet**: 2 columns × 3 rows
- **Mobile**: 1 column × 6 rows (full-width cards)

### Selection Behavior

1. Card shows selected state immediately
2. Form section smoothly animates in below (300ms fade + slide)
3. Page scrolls smoothly to form start
4. Type remains editable - user can switch types

---

## Smart Form Fields

### Universal Fields (All Types)

**Requester Information** (if not authenticated):

- Name (optional, text input)
- Email (required, email input, pre-filled if token)
- Phone (optional, tel input)

**Priority** (always present, smart defaults per type):

- Low / Normal / High / Urgent
- Defaults based on ticket type

**Submit Button**:

- Adaptive label: "Submit Bug Report", "Send Feature Request", etc.
- Loading state with spinner
- Full width on mobile, auto width on desktop

### Bug Report Form

**Contextual questions**:

- "What were you doing when the bug occurred?"
- "What did you expect to happen?"
- "What actually happened instead?"

**Fields**:

1. Subject (prefilled: "Bug: [brief description]")
2. Steps to reproduce (textarea, required)
3. Expected behavior (textarea, required)
4. Actual behavior (textarea, required)
5. Environment info (optional): Browser, OS, app version
6. Attachments: "Screenshots or error logs"

### Feature Request Form

**Contextual questions**:

- "What problem would this solve?"
- "How would you envision this working?"
- "Are there workarounds you're using now?"

**Fields**:

1. Subject (prefilled: "Feature: [brief description]")
2. Problem statement (textarea, required)
3. Proposed solution (textarea, required)
4. Use case details (textarea, optional)
5. Priority context (select: Nice to have / Important / Critical)

### Account Issue Form

**Contextual questions**:

- "What aspect of your account is affected?"
- "When did this issue start?"

**Fields**:

1. Subject (prefilled: "Account: [brief description]")
2. Issue type (select: Login / Access / Profile / Settings)
3. Description (textarea, required)
4. When it started (text input: "Today", "2 days ago")
5. Attachments: "Screenshots if applicable"

### Technical Support Form

**Contextual questions**:

- "What are you trying to accomplish?"
- "What have you tried so far?"
- "Any error messages or unexpected behavior?"

**Fields**:

1. Subject (prefilled: "Support: [brief description]")
2. Goal (textarea, required)
3. Steps taken (textarea, required)
4. Error messages (textarea, optional)
5. Environment (optional): OS, browser, app version
6. Attachments: "Logs, configs, or screenshots"

### Billing Inquiry Form

**Contextual questions**:

- "What billing aspect concerns you?"
- "Do you have a reference number (invoice, transaction)?"

**Fields**:

1. Subject (prefilled: "Billing: [brief description]")
2. Inquiry type (select: Payment / Invoice / Subscription / Refund)
3. Reference number (optional text input)
4. Details (textarea, required)
5. Attachments: "Invoices or receipts if applicable"

### Other Inquiry Form

**Contextual questions**:

- "How can we help you today?"

**Fields**:

1. Subject (required, generic placeholder)
2. Category (optional select: Partnership / Feedback / General / Legal)
3. Message (textarea, required)
4. Attachments: "Any relevant documents"

---

## Mobile Responsive Strategy

### Type Selection (Mobile)

- Single column stack (1 × 6)
- Cards full-width with more vertical padding
- Touch targets: Minimum 44px height
- Icons remain prominent
- Swipe hint: "Scroll for more types" if needed

### Form (Mobile)

- Contextual questions become collapsible accordions (collapsed by default)
- "Show guidance" toggle to expand all
- Textareas: 4 rows minimum (expandable)
- File upload: Simplified to "Attach files" button (no drag-drop)

### Navigation & Focus

- Type selection visible as pill-bar at top when scrolling form
- Back button: "Change type" in sticky header
- Submit button: Sticky at bottom (always visible)
- Progress indicator: "Step 1 of 2" → "Step 2 of 2"

### Input Adjustments

- All inputs: `min-height: 48px` for touch targets
- Font size: 16px minimum (prevents iOS auto-zoom)
- Select dropdowns: Native picker on mobile
- File input: Camera/gallery integration

### Performance

- Lazy load form section after type selection
- Optimize icons (use SVG or icon font)
- Minimize reflows during animations
- Target: <3s initial load on 3G

---

## Success, Error, & Edge Cases

### Success State

**Display**:

- Checkmark icon with success message
- Ticket number prominently displayed (large, copyable)
- Confirmation email notice
- Expected response time ("typically within 24 hours")
- Two buttons: "Create Another Ticket" and "View Ticket Status"

**Behavior**:

- Optional: Confetti-style subtle animation
- Ticket ID highlighted and copyable
- "Create Another Ticket" resets form
- "View Status" links to ticket detail (if authenticated)

### Error States

**Validation Errors** (inline, red text, shake animation):

- Empty required fields
- Email format invalid
- File too large (>5MB) or wrong type
- Subject/message too short
- Character limit warnings (real-time counter)

**API Errors** (full-page alert):

- Network failure: "Unable to connect. Please check your internet."
- Server error: "Something went wrong. Please try again."
- App not found: "Invalid app context. Check your URL."

**Recovery**:

- "Try Again" button for retry
- Form data preserved on error
- Clear next steps for each error type

### Loading States

**Initial Load**:

- Skeleton screen for type cards (6 placeholder cards)
- Smooth fade-in when ready

**Form Transition**:

- Type card → Form: 300ms slide + fade
- Loading overlay with "Preparing your form..."

**Submit State**:

- Button shows spinner + "Submitting..."
- All form fields disabled during submit
- Prevents double-submit

### Edge Cases

**No App Parameter**:

- Error: "Missing app context. Please use the link from your application."
- No fallback (app context is required)

**Token Expired**:

- Warning: "Your access token has expired. Please provide your email."
- Email field becomes enabled and required

**File Upload Errors**:

- Inline error per file: "File too large (8MB, max 5MB)"
- Retry button per file
- Remove file button (X icon)

**Character Limits**:

- Real-time counter: "42/200" (green → yellow → red)
- Soft limit warning at 90%
- Hard limit blocks input with tooltip

---

## Technical Implementation

### Component Architecture

```
app/support/tickets/new/
├── page.tsx                          # Main entry, Suspense wrapper
└── components/
    ├── ticket-type-selector.tsx      # Type card grid
    ├── smart-ticket-form.tsx         # Dynamic form container
    ├── form-templates/               # Type-specific configurations
    │   ├── bug-report-template.tsx
    │   ├── feature-request-template.tsx
    │   ├── account-issue-template.tsx
    │   ├── technical-support-template.tsx
    │   ├── billing-inquiry-template.tsx
    │   └── other-inquiry-template.tsx
    ├── success-state.tsx             # Success message component
    ├── loading-state.tsx             # Skeleton screens
    └── form-fields/                  # Reusable field components
        ├── subject-input.tsx
        ├── guidance-textarea.tsx
        ├── priority-select.tsx
        └── requester-info.tsx
```

### State Management

**Form State** (use reducer or useState):

```typescript
interface FormState {
  selectedType: TicketType | null
  subject: string
  fields: Record<string, string> // Dynamic based on type
  priority: Priority
  requesterInfo: {
    name: string
    email: string
    phone: string
  }
  attachments: AttachmentFile[]
  status: "idle" | "submitting" | "success" | "error"
}
```

**Type Configuration** (constant):

```typescript
const TICKET_TYPES = {
  BUG_REPORT: {
    id: 'bug',
    label: 'Bug Report',
    icon: Bug,
    description: 'Software defects, errors, unexpected behavior',
    examples: ['Login, crashes, error messages'],
    fields: [...],      // Field definitions
    defaultPriority: 'NORMAL'
  },
  // ... other types
}
```

### Data Flow

1. **Initial load**: Validate app + token (existing logic)
2. **Type selection**: Update `selectedType`, render template
3. **Form changes**: Update fields state, real-time validation
4. **Submit**: Transform form state → API payload
5. **Success**: Show success state, optional redirect

### Key Technical Decisions

**Client vs Server**:

- Keep as client component (already `"use client"`)
- Server-side validation in API route
- Token/app validation stays in useEffect

**Form Library**:

- Use React Hook Form (already in project)
- Zod validation for type-safe schemas
- Template-based validation (different schema per type)

**File Uploads**:

- Reuse existing `AttachmentUpload` component
- Add progress indicators per file
- Better mobile upload handling

**Animation**:

- Use Framer Motion or CSS transitions
- Smooth type card → form transition
- Subtle micro-interactions (hover, focus, success)

### API Integration

**Submit Payload Structure**:

```typescript
{
  ticketType: 'BUG_REPORT',
  appSlug: string,
  channelType: 'WEB_FORM',
  subject: string,
  message: string,                      // Constructed from template fields
  priority: Priority,
  requesterInfo: {...},
  attachments: [...],
  metadata: {
    templateFields: Record<string, string>,  // Preserve structure
    userAgent: string,
    referrer: string
  }
}
```

**API Route Changes** (if needed):

- Accept `ticketType` field
- Parse `templateFields` for structured data
- Enrich ticket metadata with type information

### Responsive Implementation

**Tailwind Breakpoints**:

```tsx
<div className="
  grid
  grid-cols-1           // Mobile: 1 column
  sm:grid-cols-2        // Tablet: 2 columns
  lg:grid-cols-3        // Desktop: 3 columns
  gap-4                 // Consistent gap
">
```

**Mobile Sticky Header**:

```tsx
<div className="
  sticky
  top-0
  z-10
  bg-background/95
  backdrop-blur
  sm:static            // Not sticky on desktop
">
```

---

## Accessibility

### Keyboard Navigation

- Type cards: Tab through, Enter/Space to select
- Form fields: Logical tab order
- Skip links: "Jump to form", "Jump to type selection"
- Focus indicators: Visible focus rings on all interactive elements

### Screen Reader Support

- Type cards: Announce icon, label, description
- Form fields: Proper labels, error announcements
- Live regions: Success/error messages
- ARIA labels: Icon-only buttons get descriptive labels

### Color Contrast

- All text meets WCAG AA standards (4.5:1 minimum)
- Focus indicators visible on all backgrounds
- Error states use color + icons (not color alone)

### Touch Targets

- Minimum 44×44px for all interactive elements
- Adequate spacing between clickable elements
- No hover-only interactions (must work on tap)

---

## Testing Strategy

### Unit Tests

- Type selector: Selection logic, keyboard navigation
- Form validation: Each template's validation rules
- State management: Form state transitions
- Field components: Individual field behavior

### Integration Tests

- Type selection → Form render flow
- Form submission → API call
- Error handling → Recovery flow
- Mobile responsiveness → Touch interactions

### Visual Regression

- Desktop layout (1920×1080)
- Tablet layout (768×1024)
- Mobile layout (375×667)
- Each ticket type form
- Success/error states

### User Testing

- Task completion rate (target: >90%)
- Time to submit (baseline vs new design)
- User satisfaction (survey)
- Mobile usability (specific focus)

---

## Migration Strategy

### Phase 1: Development (Week 1-2)

1. Create component structure
2. Implement type selector
3. Build form templates (start with 2-3 types)
4. Add mobile responsive styles
5. Integrate with existing API

### Phase 2: Testing (Week 3)

1. Internal testing and bug fixes
2. Accessibility audit
3. Cross-browser testing
4. Mobile device testing

### Phase 3: Launch (Week 4)

1. Feature flag for gradual rollout
2. Monitor error rates and completion metrics
3. Gather user feedback
4. Full rollout

### Rollback Plan

- Feature flag allows instant rollback
- Old implementation remains in codebase
- Database schema unchanged (backward compatible)
- No breaking changes to API

---

## Success Metrics

### Primary Metrics

- **Form completion rate**: Target >90% (baseline: TBD)
- **Time to submit**: Target <2 minutes (baseline: TBD)
- **Support ticket quality**: Fewer "need more info" responses
- **Mobile usage**: Target >40% of submissions (baseline: TBD)

### Secondary Metrics

- User satisfaction score (post-submission survey)
- Reduction in follow-up emails
- Ticket triage efficiency
- Error rate during submission

### Monitoring

- Analytics: Type selection distribution, field completion rates
- Errors: Validation errors, API failures, file upload issues
- Performance: Page load time, time to interactive
- Feedback: User reports, support team input

---

## Future Enhancements

Out of scope for this redesign but worth considering:

1. **Saved drafts**: Auto-save form progress, resume later
2. **Ticket templates**: Pre-defined templates for common issues
3. **Smart suggestions**: AI-powered suggestions based on type
4. **Bulk attachments**: Drag-drop multiple files at once
5. **Ticket preview**: Show how ticket will appear before submit
6. **Similar tickets**: Suggest existing tickets before creating new
7. **Multilingual**: Type templates in multiple languages
8. **Dark mode**: Enhanced dark mode support

---

## Appendix: Design Tokens

### Spacing Scale

```typescript
{
  'xs': '8px',    // Tight spacing
  'sm': '12px',   // Compact
  'md': '16px',   // Default
  'lg': '24px',   // Comfortable
  'xl': '32px',   // Spacious (mobile section)
  '2xl': '48px',  // Spacious (desktop section)
}
```

### Border Radius

```typescript
{
  'sm': '8px',    // Small elements
  'md': '10px',   // Default (design system)
  'lg': '16px',   // Cards
  'xl': '24px',   // Hero sections
}
```

### Animation Duration

```typescript
{
  'fast': '150ms',    // Micro-interactions
  'base': '300ms',    // Default transitions
  'slow': '500ms',    // Page transitions
}
```

### Easing

```typescript
{
  'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',  // Natural deceleration
}
```

---

**Document Status**: Ready for implementation planning
**Next Step**: Create detailed implementation plan using writing-plans skill
