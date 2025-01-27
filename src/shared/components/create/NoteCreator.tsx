import {publishNote} from "@/shared/services/BackendServices.tsx"
import {ChangeEvent, useEffect, useState} from "react"
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
  const canvas = document.createElement("canvas")
  canvas.width = 600
  canvas.height = 600

  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "black"

  if (text.length > 500) {
    text = text.substring(0, 500) + " ..."
  }

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

  return canvas.toDataURL()
}

function NoteCreator({handleClose, quotedEvent, repliedEvent}: NoteCreatorProps) {
  const [myPubKey] = useLocalState("user/publicKey", localStorage.getItem("pubkey"))
  const navigate = useNavigate()

  const [noteContent, setNoteContent] = useLocalState(
    repliedEvent ? "notes/replyDraft" : "notes/draft",
    ""
  )

  const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("")
  const [showNftHelp, setShowNftHelp] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // New state for checkboxes and custom title
  const [publishAsNft, setPublishAsNft] = useState(false)
  const [customTitleCheckbox, setCustomTitleCheckbox] = useState(false)
  const [customTitle, setCustomTitle] = useState("")

  const [isLeftAligned, setIsLeftAligned] = useState(false)

  const [uploadType, setUploadType] = useState("video")
  const [uploadedVideo, setUploadedVideo] = useState<string | "">("")
  const [uploadedImages, setUploadedImages] = useState<Map<string, string>>(new Map())

  function refreshImagePreviewUrl() {
    if (!uploadedVideo && uploadedImages.size === 0 && publishAsNft) {
      generateTextImage(noteContent, isLeftAligned)
        .then(setGeneratedImageUrl)
        .catch(console.error)
    } else {
      setGeneratedImageUrl("")
    }
  }

  useEffect(() => {
    refreshImagePreviewUrl()
  }, [noteContent, isLeftAligned, publishAsNft, uploadedVideo, uploadedImages])

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

  const handleFileUpload = async (url: string, oldFileName?: string) => {
    // search for the file extension between the last dot and ? or end of string
    const extensionMatch = url.match(/\.(\w+)(?:\?|$)/)
    const extension = extensionMatch && extensionMatch[1]

    //check if file extension matches any known image type
    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "bmp"]
    // Known video types
    const videoTypes = ["mp4", "webm", "mp3", "mov", "avi"]
    // if file extension matches imageType then set type to image else if matches videoType then set type to video else error
    let type = ""
    if (extension && imageTypes.includes(extension)) {
      type = "image"
    } else if (extension && videoTypes.includes(extension)) {
      type = "video"
    } else {
      setUploadError("Invalid file type")
      return
    }

    if (type === "image") {
      setUploadedImages((prev) => {
        if (prev.size >= 5) {
          setUploadError("Cannot upload more than 5 images. Delete some to upload more.")
          return prev
        }
        const newMap = new Map(prev)
        newMap.set(oldFileName, url)
        return newMap
      })
    }

    if (type === "video") {
      if (uploadedVideo) {
        setUploadError(
          "Cannot upload more than one video. Delete the current video to upload another."
        )
        return
      }
      setUploadedVideo(url)
    }

    setUploading(false)
    setUploadProgress(0)
  }

  const publish = async () => {
    // const event = new NDKEvent(ndk())
    // event.kind = 1
    // if (repliedEvent && repliedEvent.kind !== 1) event.kind = 9373
    // event.content = noteContent
    // if (customTitleCheckbox && customTitle.trim()) {
    //   event.content = `Title: ${customTitle.trim()}\n\n${noteContent}`
    // }
    // if (uploadType === "video" && uploadedVideo) {
    //   event.content += `\n\n${uploadedVideo}`
    // }
    // if (uploadType === "image" && uploadedImages.size > 0) {
    //   event.content += `\n\n${Array.from(uploadedImages.values()).join(", ")}`
    // }
    // event.ndk = ndk()
    // if (repliedEvent) {
    //   event.tags = [
    //     ["q", repliedEvent.id],
    //     ["p", repliedEvent.pubkey],
    //     ["e", repliedEvent.id, "", "reply", repliedEvent.pubkey],
    //   ]
    // }

    // addPTags(event, repliedEvent, quotedEvent)
    // event.sign().then(() => {
    //   eventsByIdCache.set(event.id, event)
    //   setNoteContent("")
    //   handleClose()
    //   navigate(`/${nip19.noteEncode(event.id)}`)
    // })
    // event.publish().catch((error) => {
    //   console.warn(`Note could not be published: ${error}`)
    // })

    // Send data to server for publishing and get back event ID
    try {
      const {eventId, event} = await publishNote({
        title: customTitleCheckbox && customTitle.trim() ? customTitle.trim() : "",
        content: noteContent,
        uploadedVideo: uploadType === "video" ? uploadedVideo : "",
        isNft: publishAsNft,
        uploadedImages: uploadType === "" ? Array.from(uploadedImages.values()) : [],
        repliedEvent: JSON.stringify(repliedEvent),
        quotedEvent: JSON.stringify(quotedEvent),
        generatedImageUrl,
      })
      // eventsByIdCache.set(eventId, event)

      setNoteContent("")
      setUploadedVideo("")
      setUploadedImages(new Map())
      setGeneratedImageUrl("")
      setCustomTitle("")
      setPublishAsNft(false)
      setCustomTitleCheckbox(false)
      setIsLeftAligned(false)
      setUploadType("image")
      setUploadError(null)
      setUploadProgress(0)

      handleClose()
      navigate(`/${nip19.noteEncode(eventId)}`)
    } catch (error: unknown) {
      console.error("Failed to publish note", error.error)
      setUploadError(error.message)
    }
  }

  return (
    <div className={`rounded-lg overflow-y-auto max-h-screen md:w-[600px]`}>
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
            onUpload={handleFileUpload}
            text="Upload file"
          />
          <select
            className="select select-bordered"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
          >
            <option value="video">Video (1)</option>
            <option value="image">Image (5)</option>
          </select>
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

        <div className="mt-4">
          {uploadType === "image" &&
            Array.from(uploadedImages.entries()).map(([oldFileName, url], index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 mb-2 border rounded bg-base-200"
              >
                <span className="truncate">{oldFileName}</span>
                <button
                  type="button"
                  className="text-error ml-2"
                  onClick={() =>
                    setUploadedImages((prev) => {
                      const newMap = new Map(prev)
                      newMap.delete(oldFileName)
                      return newMap
                    })
                  }
                >
                  X
                </button>
              </div>
            ))}

          {uploadType === "video" && uploadedVideo && (
            <div className="flex items-center justify-between p-2 mb-2 border rounded bg-base-200">
              <span className="truncate">
                {decodeURIComponent(
                  uploadedVideo.split("/").pop()?.split("?")[0] ?? "Unknown"
                )}
              </span>
              <button
                type="button"
                className="text-error ml-2"
                onClick={() => setUploadedVideo("")}
              >
                X
              </button>
            </div>
          )}
        </div>

        {/* New checkboxes section */}
        <div className="mt-4 flex gap-4 items-center">
          <p>*this server is alpha and will not publish on-chain now</p>
          {/* <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={publishAsNft}
              onChange={() => {
                setCustomTitleCheckbox(!publishAsNft)
                setPublishAsNft(!publishAsNft)
                refreshImagePreviewUrl()
              }}
            />
            <span>
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 inline-block mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 115.657 5.657l-3.172 3.172a4 4 0 01-5.657-5.657M10.172 13.828a4 4 0 00-5.657-5.657L1.343 11.343a4 4 0 005.657 5.657"
                />
              </svg>{" "}
              Publish On-Chain
            </span>
          </label> */}
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
                  refreshImagePreviewUrl()
                }}
              />
              <span>Left Align Text</span>
            </label>
          )}
        </div>
        {publishAsNft && (
          <>
            <p
              className="text-sm text-gray-500  cursor-pointer"
              onClick={() => setShowNftHelp(!showNftHelp)}
            >
              &#9432; {showNftHelp ? "Hide help" : "Show help"}
            </p>
            {showNftHelp && (
              <p className="text-sm text-gray-500">
                This will use 1 of your X credits. More credits are available in settings.
                <br />
                If there is more than one image only the first will be visible in most NFT
                tools, however they will all be published and on-chain. An image will be
                generated if one is not referenced in the post. If there are more letters
                than can fit on in the auto-generated image the rest of the content will
                still be published on-chain and visible in Etch Social and the Nostr
                ecosystem.
              </p>
            )}
          </>
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
          {generatedImageUrl && (
            <img
              src={generatedImageUrl}
              alt="Generated NFT"
              className="mx-auto mb-2 max-w-[400px] h-auto"
            />
          )}

          {!generatedImageUrl && (
            <>
              <HyperText>{noteContent}</HyperText>
              {(() => {
                if (uploadType === "video" && uploadedVideo) {
                  return <HyperText>{uploadedVideo}</HyperText>
                }
                if (uploadType === "image" && uploadedImages.size > 0) {
                  return (
                    <HyperText>{Array.from(uploadedImages.values()).join(" ")}</HyperText>
                  )
                }
                return null
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteCreator
