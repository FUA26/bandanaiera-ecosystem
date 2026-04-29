import { auth } from "@/lib/auth/config"
import { requirePermission } from "@/lib/rbac/permissions"
import { fileService } from "@/lib/services/file-service"
import { z } from "zod"
import { NextResponse } from "next/server"

const uploadFileSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  category: z.enum([
    "AVATAR",
    "DOCUMENT",
    "IMAGE",
    "VIDEO",
    "AUDIO",
    "ARCHIVE",
    "OTHER",
  ]),
  isPublic: z.boolean().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "FILE_UPLOAD")

    const body = await req.json()
    const { filename, mimeType, size, category, isPublic } =
      uploadFileSchema.parse(body)

    const file = await fileService.createUploadRecord({
      userId: session.user.id,
      filename,
      mimeType,
      size,
      category,
      isPublic,
    })

    const uploadUrl = await fileService.getPresignedUploadUrl(file.id)

    return NextResponse.json({
      file,
      uploadUrl,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
