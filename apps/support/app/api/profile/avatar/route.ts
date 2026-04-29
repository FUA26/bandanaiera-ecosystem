import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { ensureBucketExists, generateKey, s3Client } from "@/lib/storage/s3"
import { NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      )
    }

    const userId = session.user.id as string
    const bucketName = process.env.S3_BUCKET || "pisky-uploads"
    await ensureBucketExists(bucketName)
    const storagePath = generateKey(userId, "AVATAR", file.name)
    const arrayBuffer = await file.arrayBuffer()
    const body = Buffer.from(arrayBuffer)

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: storagePath,
        Body: body,
        ContentType: file.type,
      })
    )

    const fileRecord = await prisma.file.create({
      data: {
        originalFilename: file.name,
        storedFilename: storagePath.split("/").pop() || file.name,
        mimeType: file.type,
        size: file.size,
        category: "AVATAR",
        bucketName,
        storagePath,
        uploadedById: userId,
        isPublic: false,
        cdnUrl: null,
      },
    })

    return NextResponse.json({
      file: fileRecord,
      url: `/api/files/${fileRecord.id}/serve`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
