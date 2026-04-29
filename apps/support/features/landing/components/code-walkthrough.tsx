import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { codeWalkthroughExamples, type CodeExample } from "../lib/code-examples"

const tabs = [
  { value: "feature-structure", label: "Feature Structure" },
  { value: "auth", label: "Auth Flow" },
  { value: "api-patterns", label: "API Patterns" },
] as const

export function CodeWalkthrough() {
  return (
    <section className="border-t bg-muted/20 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container px-4 sm:px-6">
        <h2 className="heading-section mb-4">See How It Works</h2>
        <p className="text-body mb-10 text-muted-foreground sm:mb-12">
          Explore the architecture patterns that make Zilpo enterprise-ready.
        </p>

        <Tabs defaultValue="feature-structure" className="w-full">
          <TabsList className="no-scrollbar w-full justify-start overflow-x-auto overflow-y-hidden sm:w-auto sm:flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => {
            const example = codeWalkthroughExamples[tab.value] as
              | CodeExample
              | undefined
            if (!example) return null

            return (
              <TabsContent key={tab.value} value={tab.value}>
                <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                  <div>
                    {/* Code preview card - varies from terminal block */}
                    <div className="relative overflow-hidden rounded-xl border bg-muted/30">
                      {/* Language badge */}
                      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          tsx
                        </span>
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                          <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                        </div>
                      </div>
                      <pre className="overflow-x-auto p-4 text-xs leading-relaxed sm:p-5 sm:text-sm">
                        <code className="font-mono text-foreground/80">
                          {example.code}
                        </code>
                      </pre>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="heading-card mb-3">{example.title}</h3>
                    <p className="text-body text-muted-foreground">
                      {example.description}
                    </p>
                    {example.learnMoreHref && (
                      <a
                        href={example.learnMoreHref}
                        className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
                      >
                        See full architecture →
                      </a>
                    )}
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </section>
  )
}
