import { auth } from "@/lib/auth/config"
import { getErrorMessage, isZodError } from "@/lib/error-utils"
import { userService } from "@/lib/services/user-service"
import { changePasswordSchema } from "@/lib/validations/user"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = changePasswordSchema.parse(body)

    await userService.changeCurrentUserPassword(session.user.id, validatedData)

    return NextResponse.json({ success: true })
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
        error: getErrorMessage(error, "Failed to change password"),
      },
      { status: 500 }
    )
  }
}
