import { auth } from "@/lib/auth/config"
import { getErrorMessage, isZodError } from "@/lib/error-utils"
import { userService } from "@/lib/services/user-service"
import { updateProfileSchema } from "@/lib/validations/user"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await userService.getCurrentUserProfile(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateProfileSchema.parse(body)
    const profile = await userService.updateCurrentUserProfile(
      session.user.id,
      validatedData
    )

    return NextResponse.json({ profile })
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
        error: getErrorMessage(error, "Failed to update profile"),
      },
      { status: 500 }
    )
  }
}
