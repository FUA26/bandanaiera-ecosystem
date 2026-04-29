"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, RotateCcw } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

interface ChangePasswordFormProps {
  onSuccess?: () => void
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const newPassword = form.watch("newPassword")

  const calculatePasswordStrength = (password: string): number => {
    if (!password) {
      return 0
    }

    let strength = 0

    if (password.length >= 8) strength += 20
    if (password.length >= 12) strength += 10
    if (/[a-z]/.test(password)) strength += 15
    if (/[A-Z]/.test(password)) strength += 15
    if (/[0-9]/.test(password)) strength += 20
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20

    return Math.min(strength, 100)
  }

  const passwordStrength = calculatePasswordStrength(newPassword)

  const getStrengthLabel = (strength: number) => {
    if (strength === 0) return ""
    if (strength < 40) return "Weak"
    if (strength < 70) return "Fair"
    if (strength < 90) return "Good"
    return "Strong"
  }

  const getStrengthColor = (strength: number) => {
    if (strength === 0) return "bg-muted"
    if (strength < 40) return "bg-destructive"
    if (strength < 70) return "bg-chart-4"
    if (strength < 90) return "bg-primary"
    return "bg-chart-1"
  }

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to change password"
        )
      }

      toast.success("Password changed successfully")
      form.reset()
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      onSuccess?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password"
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
        {isLoading ? "Processing password change" : ""}
      </div>

      <Field>
        <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter your current password"
              {...form.register("currentPassword")}
              disabled={isLoading}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-3 transition-colors duration-200 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={isLoading}
              aria-label={
                showCurrentPassword ? "Hide password" : "Show password"
              }
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </FieldContent>
        <FieldError
          errors={
            form.formState.errors.currentPassword
              ? [form.formState.errors.currentPassword]
              : undefined
          }
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
        <FieldContent>
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                {...form.register("newPassword")}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-full px-3 transition-colors duration-200 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Password strength:
                  </span>
                  <span
                    className={`font-medium ${
                      passwordStrength < 40
                        ? "text-destructive"
                        : passwordStrength < 70
                          ? "text-chart-4"
                          : passwordStrength < 90
                            ? "text-primary"
                            : "text-chart-1"
                    }`}
                  >
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </FieldContent>
        <FieldDescription>
          Password must be 8-100 characters. A mix of letters, numbers, and
          symbols is recommended.
        </FieldDescription>
        <FieldError
          errors={
            form.formState.errors.newPassword
              ? [form.formState.errors.newPassword]
              : undefined
          }
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              {...form.register("confirmPassword")}
              disabled={isLoading}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-3 transition-colors duration-200 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </FieldContent>
        <FieldDescription>
          Re-enter your new password to confirm
        </FieldDescription>
        <FieldError
          errors={
            form.formState.errors.confirmPassword
              ? [form.formState.errors.confirmPassword]
              : undefined
          }
        />
      </Field>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset()
            setShowCurrentPassword(false)
            setShowNewPassword(false)
            setShowConfirmPassword(false)
          }}
          disabled={isLoading || !form.formState.isDirty}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
          {isLoading ? "Changing Password..." : "Change Password"}
        </Button>
      </div>
    </form>
  )
}
