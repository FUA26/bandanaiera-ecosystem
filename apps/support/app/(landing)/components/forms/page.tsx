import { PreviewCodeTabs } from "@/features/showcase/components/preview-code-tabs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"

export default function FormsPage() {
  return (
    <div className="container px-4 py-12 pt-20 lg:px-8 lg:pt-12">
      <div className="max-w-4xl space-y-16">
        {/* Button Section */}
        <section id="button" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Button
            </h1>
            <p className="mt-2 text-muted-foreground">
              A button component supports multiple variants, sizes, and states.
            </p>
          </div>

          {/* Primary Button */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Primary</h2>
            <PreviewCodeTabs
              preview={<Button>Click me</Button>}
              code={`import { Button } from "@workspace/ui/components/button"

<Button>Click me</Button>`}
            />
          </div>

          {/* Secondary Button */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Secondary</h2>
            <PreviewCodeTabs
              preview={<Button variant="secondary">Click me</Button>}
              code={`import { Button } from "@workspace/ui/components/button"

<Button variant="secondary">Click me</Button>`}
            />
          </div>

          {/* Destructive Button */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Destructive
            </h2>
            <PreviewCodeTabs
              preview={<Button variant="destructive">Delete</Button>}
              code={`import { Button } from "@workspace/ui/components/button"

<Button variant="destructive">Delete</Button>`}
            />
          </div>

          {/* Outline Button */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Outline</h2>
            <PreviewCodeTabs
              preview={<Button variant="outline">Click me</Button>}
              code={`import { Button } from "@workspace/ui/components/button"

<Button variant="outline">Click me</Button>`}
            />
          </div>

          {/* Ghost Button */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Ghost</h2>
            <PreviewCodeTabs
              preview={<Button variant="ghost">Click me</Button>}
              code={`import { Button } from "@workspace/ui/components/button"

<Button variant="ghost">Click me</Button>`}
            />
          </div>

          {/* Link Button */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Link</h2>
            <PreviewCodeTabs
              preview={<Button variant="link">Learn more</Button>}
              code={`import { Button } from "@workspace/ui/components/button"

<Button variant="link">Learn more</Button>`}
            />
          </div>

          {/* Button Sizes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Sizes</h2>
            <PreviewCodeTabs
              preview={
                <div className="flex items-center gap-4">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              }
              code={`import { Button } from "@workspace/ui/components/button"

<div className="flex items-center gap-4">
  <Button size="xs">Extra Small</Button>
  <Button size="sm">Small</Button>
  <Button size="default">Default</Button>
  <Button size="lg">Large</Button>
</div>`}
            />
          </div>

          <Separator />

          {/* Input Section */}
          <section id="input" className="scroll-mt-8 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Input
              </h2>
              <p className="mt-2 text-muted-foreground">
                A text input component with various states.
              </p>
            </div>

            {/* Default Input */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Default</h3>
              <PreviewCodeTabs
                preview={<Input placeholder="Enter text..." />}
                code={`import { Input } from "@workspace/ui/components/input"

<Input placeholder="Enter text..." />`}
              />
            </div>

            {/* Disabled Input */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                Disabled
              </h3>
              <PreviewCodeTabs
                preview={<Input disabled placeholder="Disabled input..." />}
                code={`import { Input } from "@workspace/ui/components/input"

<Input disabled placeholder="Disabled input..." />`}
              />
            </div>
          </section>

          <Separator />

          {/* Label Section */}
          <section id="label" className="scroll-mt-8 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Label
              </h2>
              <p className="mt-2 text-muted-foreground">
                A form label component with proper accessibility.
              </p>
            </div>

            <div className="space-y-4">
              <PreviewCodeTabs
                preview={
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="your@email.com" />
                  </div>
                }
                code={`import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="your@email.com" />
</div>`}
              />
            </div>
          </section>

          <Separator />

          <section id="field" className="scroll-mt-8 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Field
              </h2>
              <p className="mt-2 text-muted-foreground">
                A form field wrapper with label and description.
              </p>
            </div>

            <div className="space-y-4">
              <PreviewCodeTabs
                preview={
                  <div className="space-y-2">
                    <Label>Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                    />
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll never share your email with anyone else.
                    </p>
                  </div>
                }
                code={`import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"

<div className="space-y-2">
  <Label>Email address</Label>
  <Input id="email" type="email" placeholder="your@email.com" />
  <p className="text-sm text-muted-foreground">
    We'll never share your email with anyone else.
  </p>
</div>`}
              />
            </div>
          </section>

          <Separator />

          <section id="form" className="scroll-mt-8 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Form
              </h2>
              <p className="mt-2 text-muted-foreground">
                Reactive form integration with validation.
              </p>
            </div>

            <div className="space-y-4">
              <PreviewCodeTabs
                preview={
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                      />
                    </div>
                    <Button type="submit">Submit</Button>
                  </form>
                }
                code={`import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input id="name" placeholder="John Doe" />
  </div>
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="your@email.com" />
  </div>
  <Button type="submit">Submit</Button>
</form>`}
              />
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
