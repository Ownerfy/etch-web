import {ChangeEvent, DragEvent, useEffect, useState} from "react"
import {uploadToFirebaseStorage} from "@/shared/upload"
import {NDKEvent, NDKTag} from "@nostr-dev-kit/ndk"
import {useLocalState} from "irisdb-hooks"
import {drawText} from "canvas-txt"
import {ndk} from "irisdb-nostr"

import UploadButton from "@/shared/components/button/UploadButton.tsx"
import FeedItem from "@/shared/components/event/FeedItem/FeedItem"
import {Avatar} from "@/shared/components/user/Avatar.tsx"
import HyperText from "@/shared/components/HyperText.tsx"

import {eventsByIdCache} from "@/utils/memcache"
import {useNavigate} from "react-router-dom"
import {nip19} from "nostr-tools"
import Textarea from "./Textarea"

type handleCloseFunction = () => void

interface NoteCreatorProps {
  repliedEvent?: NDKEvent
  quotedEvent?: NDKEvent
  handleClose: handleCloseFunction
  reset?: boolean
}

async function generateTextImage(text: string, leftAligned: boolean) {
  console.log("running generateTextNft")
  const canvas = document.createElement("canvas")
  canvas.width = 600
  canvas.height = 600

  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "black"
  const {height} = drawText(ctx, text, {
    x: 26,
    y: 40,
    width: 545,
    height: 540,
    fontSize: 24,
    lineHeight: 32,
    align: leftAligned ? "left" : "center",
    font: "Courier",
  })

  console.log(`Total height = ${height}`)
  return canvas.toDataURL()
}

function addPTags(event: NDKEvent, repliedEvent?: NDKEvent, quotedEvent?: NDKEvent) {
  const uniquePTags = new Set<string>()
  const uniqueETags = new Set<string>()
  const otherTags: NDKTag[] = []

  if (event.pubkey) {
    uniquePTags.add(event.pubkey)
  }
  // Process existing tags
  event.tags.forEach((tag) => {
    if (tag[0] === "p" && tag[1]?.trim()) {
      uniquePTags.add(tag[1])
    } else if (tag[0] === "e" && tag[1]?.trim()) {
      uniqueETags.add(tag[1])
    } else if (tag[0] !== "p" && tag[0] !== "e") {
      otherTags.push(tag)
    }
  })
  // Add p-tags from events and e-tag the events themselves
  if (repliedEvent) {
    if (repliedEvent.pubkey?.trim()) {
      uniquePTags.add(repliedEvent.pubkey)
    }
    if (repliedEvent.id?.trim()) {
      uniqueETags.add(repliedEvent.id)
    }
    // Add p-tags from replied event
    repliedEvent.tags.forEach((tag) => {
      if (tag[0] === "p" && tag[1]?.trim()) {
        uniquePTags.add(tag[1])
      }
    })
  }

  if (quotedEvent) {
    if (quotedEvent.pubkey?.trim()) {
      uniquePTags.add(quotedEvent.pubkey)
    }
    if (quotedEvent.id?.trim()) {
      uniqueETags.add(quotedEvent.id)
    }
    // Add p-tags from quoted event
    quotedEvent.tags.forEach((tag) => {
      if (tag[0] === "p" && tag[1]?.trim()) {
        uniquePTags.add(tag[1])
      }
    })
  }
  // Filter out any empty values and reconstruct tags array
  const validPTags = Array.from(uniquePTags).filter(Boolean)
  const validETags = Array.from(uniqueETags).filter(Boolean)

  event.tags = [
    ...validPTags.map<NDKTag>((pubkey) => ["p", pubkey]),
    ...validETags.map<NDKTag>((id) => ["e", id]),
    ...otherTags,
  ]

  return event
}

function NoteCreator({handleClose, quotedEvent, repliedEvent}: NoteCreatorProps) {
  const [myPubKey] = useLocalState("user/publicKey", localStorage.getItem("pubkey"))
  const navigate = useNavigate()

  const [noteContent, setNoteContent] = useLocalState(
    repliedEvent ? "notes/replyDraft" : "notes/draft",
    ""
  )

  const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("")

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // New state for checkboxes and custom title
  const [publishAsNft, setPublishAsNft] = useState(false)
  const [customTitleCheckbox, setCustomTitleCheckbox] = useState(false)
  const [customTitle, setCustomTitle] = useState("")

  const [isLeftAligned, setIsLeftAligned] = useState(false)

  function refreshImagePreviewUrl(isNft: boolean) {
    // If we see no "http" in noteContent, generate a text image.
    if (!noteContent.match(/http/) && isNft) {
      generateTextImage(noteContent, isLeftAligned)
        .then(setPreviewImageUrl)
        .catch(console.error)
    } else {
      setPreviewImageUrl("")
    }
  }

  useEffect(() => {
    refreshImagePreviewUrl(publishAsNft)
  }, [noteContent, isLeftAligned])

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(event.target.value)
  }

  useEffect(() => {
    if (quotedEvent) {
      const quote = `nostr:${quotedEvent.encode()}`
      if (!noteContent.includes(quote)) {
        setNoteContent(`\n\n${quote}`)
      }
    }
  }, [quotedEvent])

  const handleUpload = (url: string) => {
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const textBeforeCursor = noteContent.substring(0, start)
      const textAfterCursor = noteContent.substring(end)
      // Check if cursor is in the middle of or adjacent to a word
      const isAdjacentToWord =
        (start > 0 && /\w/.test(noteContent[start - 1])) || /\w/.test(noteContent[end])

      if (isAdjacentToWord) {
        // If adjacent to a word, append the URL at the end
        setNoteContent(noteContent + ` ${url}`)
      } else {
        // Otherwise, insert the URL at the cursor position
        setNoteContent(textBeforeCursor + ` ${url} ` + textAfterCursor)
        // Move cursor to the end of the inserted URL
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + url.length + 2
        }, 0)
      }
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingOver(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingOver(false)
    const files = Array.from(event.dataTransfer.files)
    files.forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        handleFileUpload(file)
      }
    })
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    try {
      const url = await uploadToFirebaseStorage(file, (progress) => {
        setUploadProgress(progress)
      })
      handleUpload(url)
    } catch (error) {
      console.error("File upload failed:", error)
      setUploadError(error instanceof Error ? error.message : String(error))
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const publish = () => {
    const event = new NDKEvent(ndk())
    event.kind = 1
    if (repliedEvent && repliedEvent.kind !== 1) event.kind = 9373
    event.content = noteContent
    if (customTitleCheckbox && customTitle.trim()) {
      event.content = `Title: ${customTitle.trim()}\n\n${noteContent}`
    }
    event.ndk = ndk()
    if (repliedEvent) {
      event.tags = [
        ["q", repliedEvent.id],
        ["p", repliedEvent.pubkey],
        ["e", repliedEvent.id, "", "reply", repliedEvent.pubkey],
      ]
    }
    addPTags(event, repliedEvent, quotedEvent)
    event.sign().then(() => {
      eventsByIdCache.set(event.id, event)
      setNoteContent("")
      handleClose()
      navigate(`/${nip19.noteEncode(event.id)}`)
    })
    event.publish().catch((error) => {
      console.warn(`Note could not be published: ${error}`)
    })
  }

  return (
    <div
      className={`rounded-lg overflow-y-auto max-h-screen md:w-[600px] ${
        isDraggingOver ? "bg-neutral" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {repliedEvent && (
        <div className="p-4 max-h-52 overflow-y-auto border-b border-base-content/20">
          <FeedItem
            event={repliedEvent}
            showActions={false}
            showRepliedTo={false}
            truncate={0}
          />
        </div>
      )}
      <div className="p-4 md:p-8 flex flex-col gap-4">
        <Textarea
          value={noteContent}
          onChange={handleContentChange}
          onUpload={handleFileUpload}
          onPublish={publish}
          placeholder="What's on your mind?"
          quotedEvent={quotedEvent}
          onRef={setTextarea}
        />
        {uploading && (
          <div className="w-full mt-2">
            <div className="bg-neutral rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{width: `${uploadProgress}%`}}
              ></div>
            </div>
            <p className="text-sm text-center mt-1">{Math.round(uploadProgress)}%</p>
          </div>
        )}
        {uploadError && <p className="text-sm text-error mt-2">{uploadError}</p>}
        <div className="flex flex-row gap-2">
          {myPubKey && <Avatar showBadge={false} pubKey={myPubKey} />}
          <UploadButton
            className="rounded-full btn btn-primary"
            onUpload={handleUpload}
            text="Upload file"
          />
          <div className="flex-1"></div>
          <button className="btn btn-ghost rounded-full" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary rounded-full"
            disabled={!noteContent}
            onClick={publish}
          >
            Publish
          </button>
        </div>

        {/* New checkboxes section */}
        <div className="mt-4 flex gap-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={publishAsNft}
              onChange={() => {
                setCustomTitleCheckbox(!publishAsNft)
                setPublishAsNft(!publishAsNft)
                refreshImagePreviewUrl(!publishAsNft)
              }}
            />
            <span>Publish as NFT</span>
          </label>
          {publishAsNft && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customTitleCheckbox}
                onChange={() => setCustomTitleCheckbox(!customTitleCheckbox)}
              />

              <span>Custom Title</span>
            </label>
          )}
          {publishAsNft && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isLeftAligned}
                onChange={() => {
                  setIsLeftAligned(!isLeftAligned)
                  refreshImagePreviewUrl(publishAsNft)
                }}
              />
              <span>Left Align Text</span>
            </label>
          )}
        </div>

        {publishAsNft && (
          <p className="text-sm text-gray-500">
            You have 10 credits left for NFT publishing.
          </p>
        )}

        {customTitleCheckbox && (
          <input
            className="input input-bordered mt-2 w-full"
            placeholder="Enter custom title"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
        )}

        <div className="mt-4 min-h-16 overflow-y-scroll">
          <div className="text-sm uppercase text-gray-500 mb-5 font-bold">Preview</div>

          {customTitleCheckbox && customTitle.trim() && (
            <div className="mx-auto text-sm mb-8 font-bold">{customTitle}</div>
          )}

          {/* If we have a generated image URL, show it */}
          {previewImageUrl && (
            <img
              src={previewImageUrl}
              alt="Generated NFT"
              className="mx-auto mb-2 max-w-[400px] h-auto"
            />
          )}

          {!previewImageUrl && <HyperText>{noteContent}</HyperText>}
        </div>
      </div>
    </div>
  )
}

export default NoteCreator

// 1) Make generateTextImage return the generated Data URL.
// 2) Track a previewImageUrl state. If no file upload (or no URL in noteContent), generate a text image.

// async function generateTextImage(text: string) {
//   const canvas = createCanvas(600, 600);
//   const ctx = canvas.getContext('2d');
//   ctx.fillStyle = 'blue';
//   ctx.fillRect(0, 0, 600, 600);
//   ctx.fillStyle = 'black';
//   drawText(ctx, text, { x: 30, y: 30, width: 540, height: 540, fontSize: 24, font: 'Courier' });
//   return canvas.toDataURL();
// }

// function NoteCreator({ handleClose, quotedEvent, repliedEvent }: NoteCreatorProps) {
//   ...
//   const [previewImageUrl, setPreviewImageUrl] = useState<string>("");

//   useEffect(() => {
//     // If we see no "http" in noteContent, generate a text image.
//     if (!noteContent.match(/http/)) {
//       generateTextImage(noteContent).then(setPreviewImageUrl).catch(console.error);
//     } else {
//       setPreviewImageUrl("");
//     }
//   }, [noteContent]);

//   return (
//     <div ...>
//       ...
//       <div className="mt-4 min-h-16 max-h-96 overflow-y-scroll">
//         <div className="text-sm uppercase text-gray-500 mb-5 font-bold">Preview</div>

//         {customTitleCheckbox && customTitle.trim() && (
//           <div className="text-sm mb-2 font-bold">{customTitle}</div>
//         )}

//         {/* If we have a generated image URL, show it */}
//         {previewImageUrl && (
//           <img src={previewImageUrl} alt="Generated NFT" className="mb-2 max-w-full h-auto" />
//         )}

//         <HyperText>{noteContent}</HyperText>
//       </div>
//     </div>
//   );
// }
