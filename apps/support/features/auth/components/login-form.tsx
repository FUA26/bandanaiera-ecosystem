import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { PasswordInput } from "@/features/auth/components/password-input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      noValidate
    >
      <FieldGroup>
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[oklch(0.205_0.006_165)] dark:text-[oklch(0.985_0.002_165)]">
            Welcome back
          </h1>
          <p className="text-base text-[oklch(0.55_0.008_165)] dark:text-[oklch(0.70_0.005_165)]">
            Ready to pick up where you left off?
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="/forgot-password"
              className="text-sm font-medium text-[oklch(0.508_0.118_165.612)] underline-offset-4 transition-opacity hover:opacity-70"
            >
              Forgot password?
            </a>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </Field>
        <Field>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </Field>
        <FieldDescription className="text-center text-[oklch(0.55_0.008_165)] dark:text-[oklch(0.70_0.005_165)]">
          Don&apos;t have an account?{" "}
          <a
            href="/sign-up"
            className="font-medium text-[oklch(0.508_0.118_165.612)] underline-offset-4 transition-opacity hover:opacity-70"
          >
            Sign up
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
