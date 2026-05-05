/**
 * File Serve API Route
 *
 * GET /api/files/[id]/serve - Serve file content (proxies to MinIO)
 * This route allows files to be accessed through the app's domain
 * instead of directly from MinIO, avoiding CORS and endpoint issues.
 */

import { getFileById } from "@/lib/file-upload/file-crud"
import { protectApiRoute } from "@/lib/rbac-server/api-protect"
import { Permission } from "@/lib/rbac/types"
import { getS3Client } from "@/lib/storage/minio-client"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { FileCategory } from "@prisma/client"
import { NextResponse } from "next/server"

function buildAvatarFallbackSvg(label: string) {
  const safeLabel =
    label
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 2)
      .toUpperCase() || "U"

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="Avatar fallback">
      <rect width="128" height="128" rx="24" fill="#e2e8f0" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#334155">${safeLabel}</text>
    </svg>
  `.trim()
}

function createAvatarFallbackResponse(fileName: string) {
  const label = fileName.charAt(0)
  const svg = buildAvatarFallbackSvg(label)

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": `inline; filename="avatar-fallback.svg"`,
    },
  })
}

function isStorageMissingError(error: unknown) {
  if (!(error instanceof Error)) return false

  return (
    error.name === "NoSuchKey" ||
    error.name === "NotFound" ||
    error.message.includes("NoSuchKey") ||
    error.message.includes("The specified key does not exist")
  )
}

function canUseAvatarFallback(file: {
  category: FileCategory
  mimeType: string
}) {
  return (
    file.category === FileCategory.AVATAR || file.mimeType.startsWith("image/")
  )
}

function getFileOwnerLabel(file: {
  originalFilename: string
  uploadedById: string
}) {
  return file.originalFilename || file.uploadedById || "U"
}

/**
 * GET /api/files/[id]/serve
 * Serve file content through Next.js (proxies to MinIO)
 * Requires: FILE_READ_OWN or FILE_READ_ANY permission
 */
export const GET = protectApiRoute({
  permissions: ["FILE_READ_OWN"] as Permission[],
  handler: async (req, { user }, ...args) => {
    let file: Awaited<ReturnType<typeof getFileById>> | null = null

    try {
      const paramsData = args[0] as { params: Promise<{ id: string }> }
      const { id: fileId } = await paramsData.params

      // Get file record with permission check
      file = await getFileById(fileId, user.id)
      if (!file) {
        return NextResponse.json(
          { error: "File not found or access denied" },
          { status: 404 }
        )
      }

      // Check permission: user owns it OR file is public
      if (file.uploadedById !== user.id && !file.isPublic) {
        return NextResponse.json(
          { error: "You don't have permission to access this file" },
          { status: 403 }
        )
      }

      // Fetch from MinIO
      const s3 = getS3Client()
      const object = await s3.send(
        new GetObjectCommand({
          Bucket: file.bucketName,
          Key: file.storagePath,
        })
      )

      // Convert stream to buffer
      const bytes = await object.Body?.transformToByteArray()
      if (!bytes) {
        return NextResponse.json(
          { error: "Failed to read file content" },
          { status: 500 }
        )
      }

      // Return file content with proper headers
      return new NextResponse(Buffer.from(bytes), {
        headers: {
          "Content-Type": file.mimeType,
          "Content-Disposition": `inline; filename="${file.originalFilename}"`,
          "Content-Length": bytes.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable", // 1 year cache
        },
      })
    } catch (error: unknown) {
      console.error("Error serving file:", error)

      if (file && canUseAvatarFallback(file) && isStorageMissingError(error)) {
        return createAvatarFallbackResponse(getFileOwnerLabel(file))
      }

      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to serve file",
        },
        { status: 500 }
      )
    }
  },
})
