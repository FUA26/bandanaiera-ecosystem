"use client"

import { useState } from "react"
import { FileImage, File, Download, ZoomIn } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/lib/utils"
import { isImageAttachment } from "@/lib/file-upload/attachment-validation"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"

type Attachment = {
  url: string
  name: string
  type: string
  size?: number
}

type AttachmentPreviewProps = {
  attachments: Attachment[]
  className?: string
}

export function AttachmentPreview({
  attachments,
  className,
}: AttachmentPreviewProps) {
  const [previewImage, setPreviewImage] = useState<Attachment | null>(null)

  if (attachments.length === 0) return null

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {attachments.map((attachment, index) => (
          <AttachmentItem
            key={index}
            attachment={attachment}
            onPreview={setPreviewImage}
          />
        ))}
      </div>

      {/* Image Preview Dialog */}
      <Dialog
        open={previewImage !== null}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent
          className="w-full max-w-4xl bg-background p-6"
          showCloseButton={true}
        >
          <div className="relative flex h-full w-full flex-col items-center">
            <img
              src={previewImage?.url}
              alt={previewImage?.name || "Preview"}
              className="h-auto max-h-[75vh] w-full rounded-lg object-contain"
            />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {previewImage?.name}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AttachmentItem({
  attachment,
  onPreview,
}: {
  attachment: Attachment
  onPreview: (attachment: Attachment) => void
}) {
  const isImage = isImageAttachment(attachment.type)

  const handleDownload = () => {
    window.open(attachment.url, "_blank")
  }

  if (isImage) {
    return (
      <div className="group relative h-24 w-24 overflow-hidden rounded-lg border bg-muted">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="h-full w-full cursor-pointer object-cover"
          onClick={() => onPreview(attachment)}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-background/0 transition-colors group-hover:bg-background/20">
          <div
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onPreview(attachment)}
          >
            <ZoomIn className="h-4 w-4" />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 transition-colors hover:bg-muted/70">
      <File className="h-5 w-5 text-muted-foreground" />
      <span className="max-w-[150px] truncate text-sm">{attachment.name}</span>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={handleDownload}
      >
        <Download className="h-3 w-3" />
      </Button>
    </div>
  )
}
