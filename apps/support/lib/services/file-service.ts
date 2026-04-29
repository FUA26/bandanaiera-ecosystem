import { prisma } from "@/lib/prisma"
import {
  ensureBucketExists,
  generatePresignedUrl,
  generatePresignedDownloadUrl,
  generateKey,
} from "@/lib/storage/s3"

export interface UploadOptions {
  userId: string
  filename: string
  mimeType: string
  size: number
  category:
    | "AVATAR"
    | "DOCUMENT"
    | "IMAGE"
    | "VIDEO"
    | "AUDIO"
    | "ARCHIVE"
    | "OTHER"
  isPublic?: boolean
}

export const fileService = {
  async createUploadRecord(options: UploadOptions) {
    const bucketName = process.env.S3_BUCKET || "pisky-uploads"
    await ensureBucketExists(bucketName)

    const storagePath = generateKey(
      options.userId,
      options.category,
      options.filename
    )

    const file = await prisma.file.create({
      data: {
        originalFilename: options.filename,
        storedFilename: storagePath.split("/").pop() || "",
        mimeType: options.mimeType,
        size: options.size,
        category: options.category,
        storagePath,
        bucketName,
        uploadedById: options.userId,
        isPublic: options.isPublic ?? false,
        cdnUrl: options.isPublic
          ? `${process.env.CDN_URL || ""}/${storagePath}`
          : null,
      },
    })

    return file
  },

  async getPresignedUploadUrl(fileId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    })

    if (!file) {
      throw new Error("File not found")
    }

    return generatePresignedUrl(file.storagePath, file.mimeType)
  },

  async getPresignedDownloadUrl(fileId: string, userId: string) {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        uploadedById: userId,
      },
    })

    if (!file) {
      throw new Error("File not found")
    }

    return generatePresignedDownloadUrl(file.storagePath)
  },

  async listUserFiles(userId: string, category?: UploadOptions["category"]) {
    return prisma.file.findMany({
      where: {
        uploadedById: userId,
        ...(category && { category }),
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    })
  },

  async deleteFile(fileId: string, userId: string) {
    return prisma.file.updateMany({
      where: {
        id: fileId,
        uploadedById: userId,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  },
}
