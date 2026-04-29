# `@workspace/ui`

Shared UI component library for the Zilpo Admin workspace. Built with shadcn/ui, Radix UI primitives, and Tailwind CSS v4.

## Installation

This package is an internal workspace package. Add it to your `package.json`:

```json
{
  "dependencies": {
    "@workspace/ui": "workspace:*"
  }
}
```

## Usage

### Components

Import components from the package:

```tsx
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
```

### Styles

Import global styles:

```tsx
import "@workspace/ui/globals.css"
```

### Utilities

Import utility functions:

```ts
import { cn } from "@workspace/ui/lib/utils"
```

## Available Components

### Form Components

- `button` - Button with variants and sizes
- `input` - Text input field
- `textarea` - Multi-line text input
- `select` - Dropdown select
- `checkbox` - Checkbox input
- `slider` - Range slider
- `calendar` - Date picker calendar
- `field` - Form field wrapper with label
- `form` - Form integration with react-hook-form
- `input-group` - Grouped inputs with addons

### Data Display

- `card` - Content container
- `badge` - Small status or label
- `avatar` - User avatar with fallback
- `table` - Data table
- `data-table` - Advanced data table with sorting/filtering
- `separator` - Visual divider
- `skeleton` - Loading placeholder

### Overlays

- `dialog` - Modal dialog
- `popover` - Floating content container
- `tooltip` - Hover information
- `sheet` - Slide-over panel
- `alert-dialog` - Confirmation dialog
- `sonner` - Toast notifications

### Navigation

- `sidebar` - Collapsible sidebar navigation
- `tabs` - Tabbed content
- `breadcrumb` - Navigation breadcrumbs
- `command` - Command palette (Cmd+K)

### Layout

- `container` - Content container with max-width
- `scroll-area` - Custom scrollable area
- `collapsible` - Show/hide content

## Theming

The library uses CSS variables for theming with light/dark mode support via `next-themes`.

### Design Tokens

- **Primary color**: Teal/cyan (`oklch(0.508 0.118 165.612)`)
- **Border radius**: 10px
- **Font**: Inter Variable (body), Geist Mono (code)
- **Animation**: `cubic-bezier(0.16, 1, 0.3, 1)` for natural easing

## Adding Components

Add new components via the shadcn CLI:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/support
```

## Exports

```json
{
  "./globals.css": "./src/styles/globals.css",
  "./postcss.config": "./postcss.config.mjs",
  "./config/*": "./src/config/*.ts",
  "./lib/*": "./src/lib/*.ts",
  "./types/*": "./src/types/*.ts",
  "./components/*": "./src/components/*.tsx",
  "./components/data-table/*": "./src/components/data-table/*.tsx",
  "./hooks/*": "./src/hooks/*.ts"
}
```

## Dependencies

- React 19
- Radix UI primitives
- Tailwind CSS v4
- class-variance-authority
- clsx & tailwind-merge
- lucide-react (icons)
- motion (animations)
- next-themes
- sonner (toasts)
