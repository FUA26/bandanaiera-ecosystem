import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  type BucketLocationConstraint,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  // For MinIO (local development)
  ...(process.env.MINIO_ENDPOINT && {
    endpoint: process.env.MINIO_ENDPOINT,
    forcePathStyle: true,
  }),
})

export { s3Client }

let bucketReady: Promise<void> | null = null

export async function ensureBucketExists(
  bucketName: string = process.env.S3_BUCKET || "pisky-uploads"
): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }))
      } catch {
        const createBucketCommand =
          process.env.AWS_REGION && process.env.AWS_REGION !== "us-east-1"
            ? new CreateBucketCommand({
                Bucket: bucketName,
                CreateBucketConfiguration: {
                  LocationConstraint: process.env
                    .AWS_REGION as BucketLocationConstraint,
                },
              })
            : new CreateBucketCommand({ Bucket: bucketName })

        try {
          await s3Client.send(createBucketCommand)
        } catch (createError) {
          const code = (createError as { name?: string }).name
          if (
            code !== "BucketAlreadyOwnedByYou" &&
            code !== "BucketAlreadyExists"
          ) {
            throw createError
          }
        }
      }
    })()
  }

  return bucketReady
}

export async function generatePresignedUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET || "pisky-uploads",
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET || "pisky-uploads",
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

export function generateKey(
  userId: string,
  category: string,
  filename: string
): string {
  const timestamp = Date.now()
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
  return `uploads/${userId}/${category}/${timestamp}-${cleanFilename}`
}
