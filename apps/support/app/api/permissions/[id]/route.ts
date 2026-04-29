// apps/support/app/api/permissions/[id]/route.ts
import { auth } from "@/lib/auth/config"
import { getErrorMessage, isZodError } from "@/lib/error-utils"
import { permissionService } from "@/lib/services/permission-service"
import { requirePermission } from "@/lib/rbac/permissions"
import { updatePermissionSchema } from "@/lib/validations/permission"
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

    await requirePermission(session.user.id, "PERMISSION_READ")

    const { id } = await params
    const permission = await permissionService.getPermissionById(id)

    if (!permission) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ permission })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch permission",
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

    await requirePermission(session.user.id, "PERMISSION_ASSIGN")

    const { id } = await params
    const body = await req.json()
    const validatedData = updatePermissionSchema.parse(body)

    const permission = await permissionService.updatePermission(
      id,
      validatedData
    )

    return NextResponse.json({
      permission,
      message: "Permission updated successfully",
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

    return NextResponse.json(
      {
        error: getErrorMessage(error, "Failed to update permission"),
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

    await requirePermission(session.user.id, "PERMISSION_ASSIGN")

    const { id } = await params
    await permissionService.deletePermission(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = getErrorMessage(error, "Failed to delete permission")
    return NextResponse.json(
      {
        error: message,
      },
      { status: message.includes("assigned to") ? 400 : 500 }
    )
  }
}
