"use client"

import { PreviewCodeTabs } from "@/features/showcase/components/preview-code-tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { MoreHorizontal } from "lucide-react"

export default function NavigationPage() {
  return (
    <div className="container px-4 py-12 pt-20 lg:px-8 lg:pt-12">
      <div className="max-w-4xl space-y-16">
        {/* Breadcrumb Section */}
        <section id="breadcrumb" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Breadcrumb
            </h1>
            <p className="mt-2 text-muted-foreground">
              Breadcrumb navigation for hierarchical content.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Default</h2>
            <PreviewCodeTabs
              preview={
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Home
                      </a>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Components
                      </a>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Navigation</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              }
              code={`import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <a href="#">Home</a>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <a href="#">Components</a>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Navigation</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
            />
          </div>
        </section>

        {/* Tabs Section */}
        <section id="tabs" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Tabs
            </h1>
            <p className="mt-2 text-muted-foreground">
              Tabbed content with smooth transitions.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Default</h2>
            <PreviewCodeTabs
              preview={
                <Tabs defaultValue="account" className="w-[400px]">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    <p className="text-sm text-muted-foreground">
                      Make changes to your account here.
                    </p>
                  </TabsContent>
                  <TabsContent value="password">
                    <p className="text-sm text-muted-foreground">
                      Change your password here.
                    </p>
                  </TabsContent>
                </Tabs>
              }
              code={`import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <p>Make changes to your account here.</p>
  </TabsContent>
  <TabsContent value="password">
    <p>Change your password here.</p>
  </TabsContent>
</Tabs>`}
            />
          </div>
        </section>

        {/* Dropdown Menu Section */}
        <section id="dropdown-menu" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dropdown Menu
            </h1>
            <p className="mt-2 text-muted-foreground">
              Dropdown menu with various item types.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Basic</h2>
            <PreviewCodeTabs
              preview={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon-xs">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
              code={`import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { MoreHorizontal } from "lucide-react"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="icon-xs">
      <MoreHorizontal className="size-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
            />
          </div>
        </section>

        <section id="sidebar" className="scroll-mt-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sidebar
            </h1>
            <p className="mt-2 text-muted-foreground">
              Collapsible sidebar navigation.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Default</h2>
            <PreviewCodeTabs
              preview={
                <div className="flex h-[300px] w-[250px] flex-col gap-4 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-muted" />
                    <span className="font-medium">App Name</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="rounded-md bg-muted px-3 py-2 text-sm">
                      Dashboard
                    </div>
                    <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                      Settings
                    </div>
                    <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                      Profile
                    </div>
                  </div>
                </div>
              }
              code={`import { cn } from "@workspace/ui/lib/utils"

<div className="flex h-[300px] w-[250px] flex-col gap-4 rounded-lg border p-4">
  <div className="flex items-center gap-2">
    <div className="size-8 rounded-full bg-muted" />
    <span className="font-medium">App Name</span>
  </div>
  <div className="flex-1 space-y-1">
    <div className="rounded-md bg-muted px-3 py-2 text-sm">Dashboard</div>
    <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">Settings</div>
    <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">Profile</div>
  </div>
</div>`}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
