// apps/support/app/api/roles/[id]/clone/route.ts
import { auth } from "@/lib/auth/config"
import { getErrorMessage, isZodError } from "@/lib/error-utils"
import { requirePermission } from "@/lib/rbac/permissions"
import { roleService } from "@/lib/services/role-service"
import { cloneRoleSchema } from "@/lib/validations/role"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_CREATE")

    const { id } = await params
    const body = await req.json()

    const { name } = cloneRoleSchema.parse(body)

    const clonedRole = await roleService.cloneRole(id, name)

    return NextResponse.json(
      {
        role: clonedRole,
        message: "Role cloned successfully",
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

    const message = getErrorMessage(error, "Failed to clone role")
    if (message === "Role with this name already exists") {
      return NextResponse.json(
        {
          error: "Conflict",
          message,
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    )
  }
}
