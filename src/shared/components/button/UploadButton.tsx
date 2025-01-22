import React, {useRef, useState} from "react"

import {uploadToFirebaseStorage} from "@/shared/upload"

type Props = {
  onUpload: (url: string) => void
  onError?: (error: Error) => void
  text?: string
  className?: string
  disabled?: boolean
  accept?: string
}

const UploadButton = ({
  onUpload,
  onError,
  text,
  className,
  disabled = false,
  accept,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    try {
      setUploading(true)
      setProgress(0)
      setErrorMessage(null)
      const file = e.target.files[0]
      const url = await uploadToFirebaseStorage(file, (progress) => {
        setProgress(progress)
      })
      onUpload(url)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setErrorMessage(errorMessage)
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)))
      }
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center">
      <button
        className={className || "btn btn-neutral"}
        onClick={handleClick}
        disabled={disabled || uploading}
      >
        {uploading ? "Uploading..." : text || "Upload"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        style={{display: "none"}}
      />
      {uploading && (
        <div className="w-full mt-2">
          <div className="bg-neutral rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{width: `${progress}%`}}
            ></div>
          </div>
          <p className="text-sm text-center mt-1">{Math.round(progress)}%</p>
        </div>
      )}
      {errorMessage && <p className="text-sm text-error mt-2">{errorMessage}</p>}
    </div>
  )
}

export default UploadButton
