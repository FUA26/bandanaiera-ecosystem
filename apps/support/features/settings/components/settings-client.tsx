"use client"

import { ChangePasswordForm } from "./change-password-form"
import { ProfileForm } from "./profile-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { LockKeyhole, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"

interface SettingsClientProps {
  user: {
    id: string
    name?: string | null
    email: string
    image?: string | null
    role: {
      id: string
      name: string
    }
    createdAt: Date
    updatedAt: Date
  }
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account details, avatar, and password
        </p>
      </div>

      <div suppressHydrationWarning>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start gap-1 rounded-lg bg-muted/50 p-1">
            <TabsTrigger value="profile" className="gap-2">
              <UserRound className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <LockKeyhole className="h-4 w-4" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your name, email, and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm
                  initialData={{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                  }}
                  onSuccess={handleSuccess}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm onSuccess={handleSuccess} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Details about your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Account ID
            </span>
            <code className="rounded bg-muted px-2 py-1 text-xs">
              {user.id}
            </code>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Role
            </span>
            <span className="text-sm font-medium">{user.role.name}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Member Since
            </span>
            <span className="text-sm">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Last Updated
            </span>
            <span className="text-sm">
              {new Date(user.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
