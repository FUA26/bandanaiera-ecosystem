import { auth } from "@/lib/auth/config"
import { getErrorMessage, isZodError } from "@/lib/error-utils"
import { requirePermission } from "@/lib/rbac/permissions"
import {
  InvalidRolePermissionsError,
  roleService,
} from "@/lib/services/role-service"
import { createRoleSchema } from "@/lib/validations/role"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_READ")

    const { searchParams } = new URL(req.url)
    const includeStats = searchParams.get("stats") === "true"

    const roles = await roleService.listRoles()

    let stats = null
    if (includeStats) {
      stats = await roleService.getRoleStats()
    }

    return NextResponse.json({
      roles,
      stats,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error, "Failed to fetch roles"),
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_CREATE")

    const body = await req.json()
    const validatedData = createRoleSchema.parse(body)
    const role = await roleService.createRole({
      name: validatedData.name,
      permissions: validatedData.permissions,
    })

    return NextResponse.json(
      {
        role,
        message: "Role created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    if (isZodError(error)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.issues,
        },
        { status: 400 }
      )
    }

    if (error instanceof InvalidRolePermissionsError) {
      return NextResponse.json(
        {
          error: error.message,
          details: {
            missingPermissions: error.missingPermissions,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: getErrorMessage(error, "Failed to create role"),
      },
      { status: 500 }
    )
  }
}
