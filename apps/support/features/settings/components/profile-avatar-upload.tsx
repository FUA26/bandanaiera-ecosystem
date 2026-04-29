"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Camera, CircleX, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"
import { toast } from "sonner"

interface ProfileAvatarUploadProps {
  currentAvatarUrl?: string | null
  userName?: string
  onAvatarSelect: (fileId: string, url: string, file: File) => void
  onAvatarRemove?: () => void
  disabled?: boolean
  className?: string
}

export function ProfileAvatarUpload({
  currentAvatarUrl,
  userName,
  onAvatarSelect,
  onAvatarRemove,
  disabled = false,
  className,
}: ProfileAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || disabled || isUploading) {
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      onAvatarSelect(
        result.file.id as string,
        result.url as string,
        selectedFile
      )

      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }

      setPreviewUrl(null)
      setSelectedFile(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Avatar upload failed"
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancelSelection = () => {
    if (disabled || isUploading) {
      return
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(null)
    setSelectedFile(null)
  }

  const handleRemove = () => {
    if (disabled || isUploading) {
      return
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(null)
    setSelectedFile(null)
    onAvatarRemove?.()
  }

  const currentUrl = previewUrl || currentAvatarUrl

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Avatar className="h-20 w-20">
        <AvatarImage
          key={currentUrl || "default-avatar"}
          src={currentUrl || undefined}
          alt={userName ? `Profile picture for ${userName}` : "User avatar"}
        />
        <AvatarFallback>
          {userName ? (
            <span className="text-lg font-medium">
              {userName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <UserRound
              className="h-10 w-10 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">Profile Picture</p>
          <p className="text-xs text-muted-foreground">
            Upload a photo to personalize your account
          </p>
        </div>

        {!selectedFile ? (
          <div className="space-y-3">
            {/* Visually-hidden file input for accessibility */}
            <input
              id="profile-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="sr-only"
            />

            <label
              htmlFor="profile-avatar-upload"
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-primary/50 hover:bg-muted/60 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                (disabled || isUploading) &&
                  "not-allowed pointer-events-none cursor-not-allowed opacity-50"
              )}
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              Choose Photo
            </label>

            {currentUrl && onAvatarRemove && (
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                >
                  <CircleX className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <p className="truncate text-sm font-medium">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.max(1, selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={disabled || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Avatar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelSelection}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
