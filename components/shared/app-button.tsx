/**
 * App-Branded Button Component
 *
 * Modern buttons with semantic tokens from the support dashboard theme.
 *
 */

import * as React from "react"
import { Button, type ButtonProps } from "@workspace/ui"
import { cn } from "@/lib/utils"

export interface AppButtonProps extends Omit<ButtonProps, "variant"> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "ghost"
    | "outline"
    | "app-ghost"
    | "app-outline"
  children?: React.ReactNode
  className?: string
  size?: ButtonProps["size"]
}

/**
 * App-branded button
 *
 * - default/primary: semantic primary token
 * - secondary: semantic secondary token
 * - ghost: Transparent with subtle hover
 * - outline: Border only, transparent background
 */
export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant = "default", size, ...props }, ref) => {
    const getVariantProps = () => {
      switch (variant) {
        case "primary":
        case "default":
          return {
            variant: "default" as const,
            className: cn(
              "rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-sm hover:bg-primary/90",
              size === "sm" && "px-3 py-1.5 text-sm",
              size === "lg" && "px-6 py-3 text-base",
              className
            ),
          }
        case "secondary":
          return {
            variant: "default" as const,
            className: cn(
              "rounded-lg bg-secondary px-4 py-2 text-secondary-foreground shadow-sm hover:bg-secondary/90",
              size === "sm" && "px-3 py-1.5 text-sm",
              size === "lg" && "px-6 py-3 text-base",
              className
            ),
          }
        case "ghost":
        case "app-ghost":
          return {
            variant: "ghost" as const,
            className: cn("rounded-lg hover:bg-accent/50", className),
          }
        case "outline":
        case "app-outline":
          return {
            variant: "outline" as const,
            className: cn(
              "hover:border-border-medium rounded-lg border-border hover:bg-accent",
              className
            ),
          }
        default:
          return {
            variant: variant as ButtonProps["variant"],
            className,
          }
      }
    }

    const { variant: mappedVariant, className: mappedClassName } =
      getVariantProps()

    return (
      <Button
        ref={ref}
        variant={mappedVariant}
        className={mappedClassName}
        {...props}
      />
    )
  }
)

AppButton.displayName = "AppButton"

/**
 * Action button for cards/tables
 */
export function AppActionButton(props: ButtonProps) {
  return (
    <Button
      size="sm"
      className={cn(
        "rounded-lg bg-primary text-sm text-primary-foreground shadow-sm hover:bg-primary/90",
        props.className
      )}
      {...props}
    />
  )
}

/**
 * Icon button - soft hover
 */
export function AppIconButton(props: ButtonProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "rounded-lg transition-all hover:scale-105 hover:bg-accent/50",
        props.className
      )}
      {...props}
    />
  )
}

/**
 * Group of buttons
 */
export function AppButtonGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  )
}
