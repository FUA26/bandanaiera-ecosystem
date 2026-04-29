"use client"

import { Button } from "@workspace/ui/components/button"
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Check,
  Zap,
  Layers,
  Lock,
  Globe,
  Code,
  Palette,
  Plus,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { siteConfig } from "@/lib/site-config"

interface Feature {
  title: string
  description: string
  code: string
  icon: React.ReactNode
}

const features: Feature[] = [
  {
    title: "Authentication",
    description:
      "NextAuth.js v5 with credentials and OAuth. Session management, CSRF protection, and secure defaults built in.",
    code: `export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      authorize: async (credentials) => {
        // Your auth logic
      }
    })
  ]
}`,
    icon: <Lock className="h-5 w-5" />,
  },
  {
    title: "Dashboard Architecture",
    description:
      "Collapsible sidebar, team switching, stats cards, and data tables. All the patterns you need for internal tools.",
    code: `export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavProjects />
      </SidebarContent>
    </Sidebar>
  )
}`,
    icon: <Layers className="h-5 w-5" />,
  },
  {
    title: "Component Library",
    description:
      "shadcn/ui components pre-configured with your theme. Copy, paste, customize. Never build from scratch again.",
    code: `import { Button } from "@workspace/ui/components/button"

export function MyComponent() {
  return <Button>Click me</Button>
}`,
    icon: <Palette className="h-5 w-5" />,
  },
  {
    title: "Turborepo",
    description:
      "Lightning-fast builds with intelligent caching. Incremental builds, remote caching, and task pipelining at scale.",
    code: `{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**"]
    }
  }
}`,
    icon: <Zap className="h-5 w-5" />,
  },
]

const additionalFeatures = [
  { title: "TypeScript Strict", icon: <Code className="h-4 w-4" /> },
  { title: "Deployment Ready", icon: <Globe className="h-4 w-4" /> },
  { title: "API Routes", icon: <Zap className="h-4 w-4" /> },
  { title: "Data Fetching", icon: <Layers className="h-4 w-4" /> },
  { title: "Testing Setup", icon: <Check className="h-4 w-4" /> },
  { title: "CI/CD Config", icon: <Globe className="h-4 w-4" /> },
]

export function FeatureGrid() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  return (
    <section className="border-t bg-muted/20 py-16 sm:py-20 md:py-28 lg:py-32">
      <div className="container">
        {/* Section header */}
        <div className="mb-10 max-w-3xl animate-in px-4 duration-700 fade-in slide-in-from-bottom-4 sm:mb-12 sm:px-6 md:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Check className="h-3 w-4 text-primary" />
            <span>Production-ready patterns</span>
          </div>
          <h2 className="heading-hero text-balance">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
          <p className="text-body-lg mt-6 text-muted-foreground">
            Battle-tested patterns you can extend with confidence. No
            reinventing the wheel—just build your product.
          </p>
        </div>

        {/* Varied layout - alternating asymmetric grid */}
        <div className="space-y-4 px-4 sm:px-6 md:space-y-5">
          {features.map((feature, index) => {
            const isExpanded = expandedIndex === index
            const isEven = index % 2 === 0
            const delay = Math.min(index * 100, 300)

            return (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                  isExpanded
                    ? "border-primary/40 bg-background shadow-md"
                    : "border-border/60 bg-background/60 hover:border-primary/20 hover:bg-background/80"
                } animate-in duration-700 fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${delay}ms` }}
              >
                <div
                  className={`relative grid gap-5 p-5 md:gap-6 md:p-6 ${
                    isEven
                      ? "lg:grid-cols-12 lg:gap-10"
                      : "lg:grid-cols-12 lg:gap-10"
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`space-y-3 ${
                      isEven ? "lg:col-span-5" : "lg:col-span-4 lg:col-start-1"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 sm:h-9 sm:w-9">
                        {feature.icon}
                      </div>
                      <h3 className="heading-card">{feature.title}</h3>
                    </div>
                    <p className="text-body leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="group/btn -ml-3 h-8 gap-2 text-sm"
                      onClick={() =>
                        setExpandedIndex(isExpanded ? null : index)
                      }
                      aria-expanded={isExpanded}
                      aria-controls={`code-block-${index}`}
                    >
                      {isExpanded ? (
                        <>
                          <span>Hide code</span>
                          <ChevronUp className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-y-0.5" />
                        </>
                      ) : (
                        <>
                          <span>View code</span>
                          <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-y-0.5" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Code block - sharper edges for code */}
                  <div
                    id={`code-block-${index}`}
                    className={`relative overflow-hidden rounded-lg bg-muted/90 font-mono text-xs transition-all duration-300 ${
                      isExpanded
                        ? "max-h-96 opacity-100"
                        : "max-h-24 opacity-60 md:max-h-28"
                    } ${isEven ? "lg:col-span-7" : "lg:col-span-7 lg:col-start-6"}`}
                  >
                    <pre className="overflow-x-auto p-3 text-[11px] sm:p-4 sm:text-xs md:text-sm">
                      <code>{feature.code}</code>
                    </pre>

                    {/* Fade overlay when collapsed */}
                    {!isExpanded && (
                      <div className="absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t from-muted/90 to-transparent" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional features expander */}
        <div
          className="mt-6 animate-in px-4 duration-700 fade-in slide-in-from-bottom-4 sm:mt-8 sm:px-6"
          style={{ animationDelay: "400ms" }}
        >
          {!showAllFeatures ? (
            <button
              onClick={() => setShowAllFeatures(true)}
              className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>
                View all {features.length + additionalFeatures.length} features
              </span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 border-t border-border/40 py-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {additionalFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="h-4 w-4 text-primary/60">{feature.icon}</div>
                  <span>{feature.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA for the features section */}
        <div
          className="mt-10 animate-in px-4 text-center duration-700 fade-in slide-in-from-bottom-4 sm:mt-12 sm:px-6"
          style={{ animationDelay: "500ms" }}
        >
          <p className="text-body mb-5 text-muted-foreground">
            Want to see more? Explore the full architecture.
          </p>
          <Button
            variant="outline"
            size="default"
            className="group gap-2"
            asChild
          >
            <Link href={siteConfig.nav.docs}>
              View Documentation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
