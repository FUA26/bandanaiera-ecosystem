"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X, Upload, File as FileIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/lib/utils"
import {
  MAX_ATTACHMENTS_PER_TICKET,
  isImageAttachment,
  MAX_ATTACHMENT_SIZE,
} from "@/lib/file-upload/attachment-validation"

type AttachmentFile = {
  file: File
  preview?: string
  uploadedUrl?: string
  uploadProgress?: number
  error?: string
}

type AttachmentUploadProps = {
  maxFiles?: number
  onFilesChange: (files: AttachmentFile[]) => void
  onClose?: () => void
  disabled?: boolean
  value?: AttachmentFile[]
  uploadEndpoint?: "ticket-attachment" | "message-attachment"
  token?: string // Optional JWT token for authenticated uploads
}

export function AttachmentUpload({
  maxFiles = MAX_ATTACHMENTS_PER_TICKET,
  onFilesChange,
  onClose,
  disabled = false,
  value = [],
  uploadEndpoint = "ticket-attachment",
  token,
}: AttachmentUploadProps) {
  const [files, setFiles] = useState<AttachmentFile[]>(value)
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Process files
      const newFiles: AttachmentFile[] = acceptedFiles.map((file) => {
        const preview = isImageAttachment(file.type)
          ? URL.createObjectURL(file)
          : undefined

        return {
          file,
          preview,
          uploadProgress: 0,
        }
      })

      const baseIndex = files.length
      let nextFiles = [...files, ...newFiles]
      setFiles(nextFiles)
      onFilesChange(nextFiles)

      // Prepare headers for upload
      const headers: HeadersInit = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      // Upload files
      setUploading(true)
      for (let i = 0; i < newFiles.length; i++) {
        const fileData = newFiles[i]
        if (!fileData) continue

        const formData = new FormData()
        formData.append("files", fileData.file)

        try {
          const response = await fetch(`/api/upload/${uploadEndpoint}`, {
            method: "POST",
            headers: Object.keys(headers).length > 0 ? headers : undefined,
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("Upload failed:", errorData)
            throw new Error(errorData.error || "Upload failed")
          }

          const result = await response.json()
          console.log("Upload success:", result.files[0])

          // Update file with uploaded data
          const targetIndex = baseIndex + i
          const existingFile = nextFiles[targetIndex]
          if (existingFile) {
            nextFiles = nextFiles.map((current, index) =>
              index === targetIndex
                ? {
                    ...current,
                    uploadedUrl: result.files[0].url,
                    uploadProgress: 100,
                  }
                : current
            )
            setFiles(nextFiles)
            onFilesChange(nextFiles)
          }
        } catch (error: any) {
          const targetIndex = baseIndex + i
          nextFiles = nextFiles.map((current, index) =>
            index === targetIndex
              ? {
                  ...current,
                  error: error.message,
                }
              : current
          )
          setFiles(nextFiles)
          onFilesChange(nextFiles)
        }
      }
      setUploading(false)

      // Call onClose callback if all files uploaded successfully
      if (onClose && nextFiles.every((f) => f.uploadedUrl)) {
        onClose()
      }
    },
    [files, maxFiles, onFilesChange, uploadEndpoint, onClose, token]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: MAX_ATTACHMENT_SIZE,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    disabled: disabled || files.length >= maxFiles || uploading,
  })

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesChange(updated)
  }

  return (
    <div className="space-y-3">
      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((fileData, index) => (
            <AttachmentThumbnail
              key={index}
              file={fileData}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}

      {/* Dropzone */}
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25",
            (disabled || uploading) && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop files here..."
              : `Drag & drop or click to attach (max ${maxFiles} files, 5MB each)`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Images: JPG, PNG, GIF, WebP | Documents: PDF, DOC, DOCX, XLS, XLSX
          </p>
        </div>
      )}
    </div>
  )
}

function AttachmentThumbnail({
  file,
  onRemove,
}: {
  file: AttachmentFile
  onRemove: () => void
}) {
  const isImg = file.preview || isImageAttachment(file.file.type)

  return (
    <div className="group relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
      {file.preview ? (
        <img
          src={file.preview}
          alt={file.file.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <FileIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      {file.uploadProgress !== undefined &&
        file.uploadProgress < 100 &&
        file.uploadProgress > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      {file.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/80">
          <span className="p-1 text-center text-xs text-white">Error</span>
        </div>
      )}
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-1 right-1 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="absolute right-0 bottom-0 left-0 truncate bg-background/80 p-1 text-xs">
        {file.file.name}
      </div>
    </div>
  )
}

export type { AttachmentFile }
