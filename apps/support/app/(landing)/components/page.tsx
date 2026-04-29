import { categories } from "@/features/showcase/lib/component-data"
import { Card } from "@workspace/ui/components/card"
import { ArrowRight, Sparkles } from "lucide-react"

export default function ComponentsPage() {
  const [featuredCategory, ...remainingCategories] = categories

  if (!featuredCategory) {
    return null
  }

  return (
    <div className="container px-4 py-16 pt-24 lg:px-8 lg:pt-20">
      <div className="max-w-3xl">
        {/* Hero section with more breathing room */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Components
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Building blocks for your SaaS. Production-ready components built
            with shadcn/ui.
            <span className="mt-2 block text-sm">
              Start with forms. They&apos;re the foundation of every interface.
            </span>
          </p>
        </div>

        {/* Featured category - prominent placement */}
        <a href={featuredCategory.path} className="group mb-12 block">
          <Card className="relative overflow-hidden border-primary/20 bg-primary/5 p-8 transition-all hover:border-primary/40 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                    <Sparkles className="size-3" />
                    Start here
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {featuredCategory.components.length} components
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-foreground transition-colors group-hover:text-primary">
                  {featuredCategory.name}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {featuredCategory.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {featuredCategory.components.slice(0, 3).map((component) => (
                    <span
                      key={component}
                      className="rounded-md bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {component}
                    </span>
                  ))}
                  {featuredCategory.components.length > 3 && (
                    <span className="rounded-md bg-background px-2.5 py-1 text-xs text-muted-foreground">
                      +{featuredCategory.components.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="size-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Card>
        </a>

        {/* Divider with more spacing */}
        <div className="mb-8 border-t border-border" />

        {/* List layout for remaining categories - breaks card monotony */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
            More Categories
          </h3>
          {remainingCategories.map((category) => (
            <a
              key={category.path}
              href={category.path}
              className="group -mx-4 block rounded-lg border-b border-border px-4 py-4 transition-colors last:border-0 hover:bg-muted/50 sm:mx-0 sm:px-4 sm:hover:px-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                      {category.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {category.components.length} components
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
