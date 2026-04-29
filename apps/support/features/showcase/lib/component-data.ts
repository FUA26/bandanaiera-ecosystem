export interface ComponentData {
  name: string
  category: string
  description: string
  path: string
}

export interface CategoryData {
  name: string
  description: string
  path: string
  components: string[]
}

export const categories: CategoryData[] = [
  {
    name: "Forms",
    description: "Form input and control components",
    path: "/components/forms",
    components: ["button", "input", "field", "form", "label"],
  },
  {
    name: "Navigation",
    description: "Navigation and menu components",
    path: "/components/navigation",
    components: ["breadcrumb", "tabs", "sidebar", "dropdown-menu"],
  },
  {
    name: "Overlays & Feedback",
    description: "Overlays, toasts, and loading states",
    path: "/components/overlays",
    components: ["sheet", "tooltip", "sonner", "skeleton", "collapsible"],
  },
  {
    name: "Data Display",
    description: "Data presentation components",
    path: "/components/data-display",
    components: ["card", "avatar", "separator"],
  },
]

export const components: Record<string, ComponentData> = {
  button: {
    name: "Button",
    category: "Forms",
    description:
      "A button component supports multiple variants, sizes, and states.",
    path: "/components/forms#button",
  },
  input: {
    name: "Input",
    category: "Forms",
    description: "A text input component with various states.",
    path: "/components/forms#input",
  },
  field: {
    name: "Field",
    category: "Forms",
    description: "A form field wrapper with label and description.",
    path: "/components/forms#field",
  },
  form: {
    name: "Form",
    category: "Forms",
    description: "Reactive form integration with validation.",
    path: "/components/forms#form",
  },
  label: {
    name: "Label",
    category: "Forms",
    description: "A form label component with proper accessibility.",
    path: "/components/forms#label",
  },
  breadcrumb: {
    name: "Breadcrumb",
    category: "Navigation",
    description: "Breadcrumb navigation for hierarchical content.",
    path: "/components/navigation#breadcrumb",
  },
  tabs: {
    name: "Tabs",
    category: "Navigation",
    description: "Tabbed content with smooth transitions.",
    path: "/components/navigation#tabs",
  },
  sidebar: {
    name: "Sidebar",
    category: "Navigation",
    description: "Collapsible sidebar navigation.",
    path: "/components/navigation#sidebar",
  },
  "dropdown-menu": {
    name: "Dropdown Menu",
    category: "Navigation",
    description: "Dropdown menu with various item types.",
    path: "/components/navigation#dropdown-menu",
  },
  sheet: {
    name: "Sheet",
    category: "Overlays & Feedback",
    description: "Slide-over panel from any edge.",
    path: "/components/overlays#sheet",
  },
  tooltip: {
    name: "Tooltip",
    category: "Overlays & Feedback",
    description: "Hover tooltip with positioning options.",
    path: "/components/overlays#tooltip",
  },
  sonner: {
    name: "Sonner",
    category: "Overlays & Feedback",
    description: "Toast notifications for user feedback.",
    path: "/components/overlays#sonner",
  },
  skeleton: {
    name: "Skeleton",
    category: "Overlays & Feedback",
    description: "Loading placeholder with various shapes.",
    path: "/components/overlays#skeleton",
  },
  collapsible: {
    name: "Collapsible",
    category: "Overlays & Feedback",
    description: "Expandable/collapsible content section.",
    path: "/components/overlays#collapsible",
  },
  card: {
    name: "Card",
    category: "Data Display",
    description: "Card container for grouped content.",
    path: "/components/data-display#card",
  },
  avatar: {
    name: "Avatar",
    category: "Data Display",
    description: "User avatar with fallback options.",
    path: "/components/data-display#avatar",
  },
  separator: {
    name: "Separator",
    category: "Data Display",
    description: "Visual divider with orientation options.",
    path: "/components/data-display#separator",
  },
}
