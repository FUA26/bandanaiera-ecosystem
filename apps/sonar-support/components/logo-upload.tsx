"use client"

/**
 * Logo Upload Component
 *
 * Component for uploading and managing site logo with preview
 */

import { Button } from "@workspace/ui/components/button"
import { cn } from "@/lib/utils"
import { ImagePlus, Trash2, Loader2 } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

interface LogoUploadProps {
  value?: string | null
  logoUrl?: string | null
  logoId?: string | null
  onChange: (value: string) => void
  disabled?: boolean
}

interface UploadedFile {
  id: string
  cdnUrl: string
  serveUrl: string
}

export function LogoUpload({
  value,
  logoUrl,
  onChange,
  disabled,
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [currentLogoId, setCurrentLogoId] = useState<string | null>(
    value || null
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(logoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploading(true)

    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", "IMAGE")
      formData.append("isPublic", "true")

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload logo")
      }

      const result = await response.json()
      const uploadedFile = result.file as UploadedFile

      onChange(uploadedFile.id)
      setCurrentLogoId(uploadedFile.id)
      // Use serveUrl for public access through the app
      setPreviewUrl(`/api/public/files/${uploadedFile.id}/serve`)
      toast.success("Logo uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to upload logo"
      )
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    onChange("")
    setCurrentLogoId(null)
    setPreviewUrl(null)
    toast.success("Logo removed")
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {previewUrl ? (
        <div className="relative inline-block">
          <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-background">
              <img
                src={previewUrl}
                alt="Site logo preview"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Current Logo</p>
              <p className="text-xs text-muted-foreground">
                Recommended: Square image, at least 200x200px
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClick}
                  disabled={disabled || isUploading}
                >
                  <ImagePlus className="mr-1 h-4 w-4" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            "hover:border-muted-foreground/50 hover:bg-muted/50",
            disabled &&
              "cursor-not-allowed opacity-50 hover:border-border hover:bg-transparent"
          )}
          onClick={handleClick}
        >
          {isUploading ? (
            <Loader2 className="mb-2 h-10 w-10 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="mb-2 h-10 w-10 text-muted-foreground" />
          )}
          <p className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Click to upload logo"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, or GIF (max 5MB)
          </p>
          <p className="text-xs text-muted-foreground">
            Recommended: Square image, at least 200x200px
          </p>
        </div>
      )}

      <input type="hidden" value={value || ""} />
    </div>
  )
}
