// apps/support/lib/validations/permission.ts
import { z } from "zod"

export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(3, "Permission name must be at least 3 characters")
    .max(100, "Permission name must not exceed 100 characters")
    .regex(
      /^[A-Z_0-9]+$/,
      "Permission name must be uppercase with underscores only (e.g., USER_READ)"
    )
    .refine(
      (val) => !val.startsWith("_") && !val.endsWith("_"),
      "Permission name cannot start or end with underscore"
    )
    .refine(
      (val) => !val.includes("__"),
      "Permission name cannot contain double underscores"
    )
    .transform((val) => val.toUpperCase()),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must not exceed 50 characters")
    .transform((val) => val.trim().toUpperCase())
    .refine(
      (val) => /^[A-Z0-9\s_-]+$/.test(val),
      "Category can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
})

export const updatePermissionSchema = createPermissionSchema.partial()

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>
