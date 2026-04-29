import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { s3Client } from "@/lib/storage/s3"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { Buffer } from "node:buffer"

export const runtime = "nodejs"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const file = await prisma.file.findUnique({
      where: { id },
      select: {
        id: true,
        uploadedById: true,
        storagePath: true,
        mimeType: true,
        cdnUrl: true,
        isPublic: true,
        deletedAt: true,
      },
    })

    if (!file || file.deletedAt) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    if (!file.isPublic && file.uploadedById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (file.cdnUrl) {
      return NextResponse.redirect(file.cdnUrl)
    }

    const objectResult = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET || "pisky-uploads",
        Key: file.storagePath,
      })
    )

    if (!objectResult.Body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const chunks: Uint8Array[] = []
    for await (const chunk of objectResult.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }

    const body = Buffer.concat(chunks)

    return new NextResponse(body, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": body.byteLength.toString(),
        "Cache-Control": "private, max-age=0, no-store",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to serve file",
      },
      { status: 500 }
    )
  }
}
