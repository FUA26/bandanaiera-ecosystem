import { PreviewCodeTabs } from "@/features/showcase/components/preview-code-tabs"
import { Card } from "@workspace/ui/components/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Separator } from "@workspace/ui/components/separator"

export default function DataDisplayPage() {
  return (
    <div className="container px-4 py-12 pt-20 lg:px-8 lg:pt-12">
      <div className="max-w-4xl space-y-16">
        {/* Card Section */}
        <section id="card" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Card
            </h1>
            <p className="mt-2 text-muted-foreground">
              Card container for grouped content.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Default</h2>
            <PreviewCodeTabs
              preview={
                <Card className="p-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Card Title</h3>
                    <p className="text-sm text-muted-foreground">
                      This is a card component containing some example content.
                    </p>
                  </div>
                </Card>
              }
              code={`import { Card } from "@workspace/ui/components/card"

<Card className="p-6">
  <div className="space-y-2">
    <h3 className="text-lg font-semibold">Card Title</h3>
    <p className="text-sm text-muted-foreground">
      This is a card component containing some example content.
    </p>
  </div>
</Card>`}
            />
          </div>
        </section>

        {/* Avatar Section */}
        <section id="avatar" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Avatar
            </h1>
            <p className="mt-2 text-muted-foreground">
              User avatar with fallback options.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Sizes</h2>
            <PreviewCodeTabs
              preview={
                <div className="flex items-center gap-4">
                  <Avatar className="size-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar className="size-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar className="size-14">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
              }
              code={`import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

<div className="flex items-center gap-4">
  <Avatar className="size-8">
    <AvatarImage src="https://github.com/shadcn.png" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
  <Avatar className="size-10">
    <AvatarImage src="https://github.com/shadcn.png" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarImage src="https://github.com/shadcn.png" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
  <Avatar className="size-14">
    <AvatarImage src="https://github.com/shadcn.png" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
</div>`}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Fallback</h2>
            <PreviewCodeTabs
              preview={
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              }
              code={`import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"

<Avatar>
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`}
            />
          </div>
        </section>

        {/* Separator Section */}
        <section id="separator" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Separator
            </h1>
            <p className="mt-2 text-muted-foreground">
              Visual divider with orientation options.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Horizontal
            </h2>
            <PreviewCodeTabs
              preview={
                <div className="w-[200px] space-y-4">
                  <div>Content above</div>
                  <Separator />
                  <div>Content below</div>
                </div>
              }
              code={`import { Separator } from "@workspace/ui/components/separator"

<div className="w-[200px] space-y-4">
  <div>Content above</div>
  <Separator />
  <div>Content below</div>
</div>`}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
