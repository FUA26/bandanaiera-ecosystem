import { auth } from "@/lib/auth/config"
import { getErrorMessage, isZodError } from "@/lib/error-utils"
import { requirePermission } from "@/lib/rbac/permissions"
import {
  InvalidRolePermissionsError,
  roleService,
} from "@/lib/services/role-service"
import { createRoleSchema } from "@/lib/validations/role"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_READ")

    const { id } = await params
    const role = await roleService.getRoleById(id)

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    return NextResponse.json({ role })
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error, "Failed to fetch role"),
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_UPDATE")

    const { id } = await params
    const body = await req.json()
    const validatedData = createRoleSchema.parse(body)

    const role = await roleService.updateRole(id, {
      name: validatedData.name,
      permissions: validatedData.permissions,
    })
    return NextResponse.json({
      role,
      message: "Role updated successfully",
    })
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
        error: getErrorMessage(error, "Failed to update role"),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_DELETE")

    const { id } = await params
    await roleService.deleteRole(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error, "Failed to delete role"),
      },
      { status: 500 }
    )
  }
}
