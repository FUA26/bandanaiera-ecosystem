"use client"

import { ProfileAvatarUpload } from "./profile-avatar-upload"
import { Button } from "@workspace/ui/components/button"
import { RotateCcw } from "lucide-react"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface ProfileFormProps {
  initialData: {
    id: string
    name?: string | null
    email: string
    image?: string | null
  }
  onSuccess?: () => void
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialData.image || null
  )
  const { update } = useSession()

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email,
      image: initialData.image || null,
    },
  })

  useEffect(() => {
    const nextValues = {
      name: initialData.name || "",
      email: initialData.email,
      image: initialData.image || null,
    }

    form.reset(nextValues)
    setAvatarUrl(nextValues.image)
  }, [form, initialData.email, initialData.image, initialData.name])

  const syncSession = async (profile: {
    name: string
    email: string
    image?: string | null
  }) => {
    try {
      await update({
        name: profile.name,
        email: profile.email,
        image: profile.image || null,
      })
    } catch {
      // Session updates are best-effort. The next refresh still picks up server state.
    }
  }

  const saveProfile = async (values: UpdateProfileInput) => {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error || result.message || "Failed to update profile"
      )
    }

    await syncSession(result.profile)
    return result.profile as {
      id: string
      name: string
      email: string
      image: string | null
    }
  }

  const handleAvatarSelect = async (_fileId: string, url: string) => {
    setIsLoading(true)

    const currentValues = form.getValues()
    const optimisticImage = url

    setAvatarUrl(optimisticImage)
    form.setValue("image", optimisticImage, { shouldDirty: false })

    try {
      const profile = await saveProfile({
        name: currentValues.name,
        email: currentValues.email,
        image: optimisticImage,
      })

      form.reset({
        name: profile.name || "",
        email: profile.email,
        image: profile.image || null,
      })
      setAvatarUrl(profile.image)
      toast.success("Avatar updated successfully")
      onSuccess?.()
    } catch (error) {
      setAvatarUrl(initialData.image || null)
      form.setValue("image", initialData.image || null, { shouldDirty: false })
      toast.error(
        error instanceof Error ? error.message : "Failed to update avatar"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarRemove = async () => {
    setIsLoading(true)

    const currentValues = form.getValues()
    setAvatarUrl(null)
    form.setValue("image", null, { shouldDirty: false })

    try {
      const profile = await saveProfile({
        name: currentValues.name,
        email: currentValues.email,
        image: null,
      })

      form.reset({
        name: profile.name || "",
        email: profile.email,
        image: profile.image || null,
      })
      toast.success("Avatar removed successfully")
      onSuccess?.()
    } catch (error) {
      setAvatarUrl(initialData.image || null)
      form.setValue("image", initialData.image || null, { shouldDirty: false })
      toast.error(
        error instanceof Error ? error.message : "Failed to remove avatar"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true)

    try {
      const profile = await saveProfile(data)

      form.reset({
        name: profile.name || "",
        email: profile.email,
        image: profile.image || null,
      })
      setAvatarUrl(profile.image)
      toast.success("Profile updated successfully")
      onSuccess?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      aria-busy={isLoading}
    >
      {/* Visually-hidden live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading ? "Saving profile" : ""}
      </div>

      <ProfileAvatarUpload
        currentAvatarUrl={avatarUrl}
        userName={form.watch("name") || undefined}
        onAvatarSelect={handleAvatarSelect}
        onAvatarRemove={handleAvatarRemove}
        disabled={isLoading}
      />

      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            placeholder="Your name"
            {...form.register("name")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldDescription>
          Optional. Leave blank to clear your display name.
        </FieldDescription>
        <FieldError
          errors={
            form.formState.errors.name
              ? [form.formState.errors.name]
              : undefined
          }
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            {...form.register("email")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldDescription>
          Used for sign-in and account notifications
        </FieldDescription>
        <FieldError
          errors={
            form.formState.errors.email
              ? [form.formState.errors.email]
              : undefined
          }
        />
      </Field>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            form.reset({
              name: initialData.name || "",
              email: initialData.email,
              image: initialData.image || null,
            })
          }
          disabled={isLoading || !form.formState.isDirty}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
