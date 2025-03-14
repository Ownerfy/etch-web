import {bskyLikePost, bskyRepostPost} from "@/shared/services/BackendServices"
import {useNavigate} from "react-router-dom"
import {useLocalState} from "irisdb-hooks"
import {toast} from "react-hot-toast"
import React, {useState} from "react"
import classNames from "classnames"
import {format} from "date-fns"

// Updated interface to match the actual BlueSky API response structure
export interface BskyPostAuthor {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

export interface BskyEmbed {
  $type: string
  images?: {
    thumb: string
    fullsize: string
    alt?: string
    aspectRatio?: {
      width: number
      height: number
    }
  }[]
  record?: Record<string, unknown>
}

export interface BskyPostRecord {
  $type: string
  text: string
  createdAt: string
  embed?: Record<string, unknown>
}

export interface BskyPost {
  post: {
    uri: string
    cid: string
    author: BskyPostAuthor
    record: BskyPostRecord
    embed?: BskyEmbed
    replyCount?: number
    repostCount?: number
    likeCount?: number
    indexedAt: string
    viewer?: {
      like: boolean
      repost: boolean
    }
  }
  reply?: {
    root?: Record<string, unknown>
    parent?: Record<string, unknown>
  }
}

interface BskyFeedItemProps {
  post: BskyPost
  isReplyPreview?: boolean
  small?: boolean
}

function BskyFeedItem({post, isReplyPreview = false, small = false}: BskyFeedItemProps) {
  const [notesTheme] = useLocalState("user/notesTheme", CONFIG.defaultNotesTheme)
  const [showImage, setShowImage] = useState(true)
  const navigate = useNavigate()
  const [, setNewPostOpen] = useLocalState("home/newPostOpen", false)
  const [, setBskyReplyPost] = useLocalState("compose/bskyReplyPost", null)

  // Add state for like and repost
  const [isLiked, setIsLiked] = useState(post.post?.viewer?.like || false)
  const [isReposted, setIsReposted] = useState(post.post?.viewer?.repost || false)
  const [likeCount, setLikeCount] = useState(post.post?.likeCount || 0)
  const [repostCount, setRepostCount] = useState(post.post?.repostCount || 0)
  const [isActionInProgress, setIsActionInProgress] = useState(false)

  // Safely access nested properties
  const postData = post.post || post // Handle both {post: {...}} and direct post format
  const author = postData.author
  const record = postData.record || {}
  const embed = postData.embed

  // Check for image embeds
  const hasImageEmbed =
    embed &&
    embed.$type === "app.bsky.embed.images#view" &&
    embed.images &&
    embed.images.length > 0

  // Function to navigate to post detail
  const navigateToPostDetail = (e: React.MouseEvent) => {
    if (isReplyPreview) return // Don't navigate if in reply preview mode

    // Don't navigate if clicking on an image or a link
    if (
      (e.target as HTMLElement).tagName === "A" ||
      (e.target as HTMLElement).tagName === "IMG" ||
      (e.target as HTMLElement).closest(".post-actions")
    ) {
      return
    }

    const postId = postData.uri || postData.cid
    if (postId) {
      navigate(`/bsky/post/${encodeURIComponent(postId)}`)
    }
  }

  // Function to handle like action
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isActionInProgress) return

    const uri = postData.uri
    const cid = postData.cid

    if (!uri || !cid) {
      toast.error("Cannot like this post")
      return
    }

    setIsActionInProgress(true)

    try {
      // Optimistically update UI
      setIsLiked(!isLiked)
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))

      // Send request to server
      await bskyLikePost(uri, cid, !isLiked)
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked)
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1))
      toast.error("Failed to like post")
      console.error("Like error:", error)
    } finally {
      setIsActionInProgress(false)
    }
  }

  // Function to handle repost action
  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isActionInProgress) return

    const uri = postData.uri
    const cid = postData.cid

    if (!uri || !cid) {
      toast.error("Cannot repost this post")
      return
    }

    setIsActionInProgress(true)

    try {
      // Optimistically update UI
      setIsReposted(!isReposted)
      setRepostCount((prev) => (isReposted ? prev - 1 : prev + 1))

      // Send request to server
      await bskyRepostPost(uri, cid, !isReposted)
    } catch (error) {
      // Revert on error
      setIsReposted(isReposted)
      setRepostCount((prev) => (isReposted ? prev + 1 : prev - 1))
      toast.error("Failed to repost")
      console.error("Repost error:", error)
    } finally {
      setIsActionInProgress(false)
    }
  }

  // Function to handle reply action - updated to use NoteCreator
  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation()

    const postUri = postData.uri
    if (!postUri) {
      toast.error("Cannot reply to this post")
      return
    }

    // Convert the post to a plain object before storing
    setBskyReplyPost(JSON.parse(JSON.stringify(post)))

    // Open the NoteCreator dialog
    setNewPostOpen(true)
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))

      if (diffMins < 1) return "just now"
      if (diffMins < 60) return `${diffMins}m`
      if (diffMins < 24 * 60) return `${Math.floor(diffMins / 60)}h`
      if (diffMins < 7 * 24 * 60) return `${Math.floor(diffMins / (60 * 24))}d`

      return format(date, "MMM d")
    } catch (e) {
      return dateString
    }
  }

  const getText = () => {
    return record.text || ""
  }

  const getDate = () => {
    return record.createdAt || postData.indexedAt || ""
  }

  const formattedDate = formatDate(getDate())
  const displayName = author?.displayName || author?.handle || ""
  const handle = author?.handle || ""
  const text = getText()

  // If we don't have the minimum data to display, show a placeholder
  if (!text || !author) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-base-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-2 bg-base-300 rounded w-3/4"></div>
            <div className="space-y-1">
              <div className="h-2 bg-base-300 rounded"></div>
              <div className="h-2 bg-base-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={classNames(
        "flex pb-4 flex-col px-4 transition-colors duration-200 ease-in-out relative",
        {
          "border-b border-custom": !isReplyPreview && !small,
          "pt-3 pb-0": notesTheme === "etch",
          "pt-5 pb-5 hover:relative": notesTheme === "nestr",
          "hover:bg-[var(--note-hover-color)]": !isReplyPreview,
          "cursor-pointer": !isReplyPreview,
          "text-base-content/50": small,
        }
      )}
      onClick={navigateToPostDetail}
    >
      <div className="flex flex-row gap-4">
        {!isReplyPreview && (
          <div className="avatar">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {author.avatar ? (
                <img src={author.avatar} alt={displayName} />
              ) : (
                <div className="bg-primary/20 w-full h-full flex items-center justify-center text-primary font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}
        <div className={classNames("flex-1", {"flex-wrap": small})}>
          <div className="flex items-center gap-2">
            <span className="font-bold">{displayName}</span>
            {handle && !small && (
              <span className="text-base-content/50 text-sm">@{handle}</span>
            )}
            {formattedDate && (
              <>
                <span className="text-base-content/50 text-sm">·</span>
                <span className="text-base-content/50 text-sm">{formattedDate}</span>
              </>
            )}
          </div>
          <div className="mt-1 whitespace-pre-wrap">
            {small ? <div className="line-clamp-3">{text}</div> : text}
          </div>

          {hasImageEmbed && showImage && embed?.images && (
            <div
              className={classNames("mt-2 rounded-md overflow-hidden", {
                "max-h-32": small,
              })}
            >
              <img
                src={embed.images[0].fullsize}
                alt={embed.images[0].alt || "Post image"}
                className={classNames("w-auto object-contain cursor-pointer", {
                  "max-h-96": !small,
                  "max-h-32": small,
                })}
                onClick={(e) => e.stopPropagation()}
                onError={() => setShowImage(false)}
              />
            </div>
          )}

          {!isReplyPreview && !small && (
            <div className="flex gap-6 mt-3 text-base-content/50 post-actions">
              <div
                className={`flex items-center gap-1 cursor-pointer hover:text-primary ${isActionInProgress ? "opacity-50" : ""}`}
                onClick={handleReply}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>{postData.replyCount || 0}</span>
              </div>
              <div
                className={`flex items-center gap-1 cursor-pointer hover:text-success ${isReposted ? "text-success" : ""} ${isActionInProgress ? "opacity-50" : ""}`}
                onClick={handleRepost}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isReposted ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
                <span>{repostCount}</span>
              </div>
              <div
                className={`flex items-center gap-1 cursor-pointer hover:text-error ${isLiked ? "text-error" : ""} ${isActionInProgress ? "opacity-50" : ""}`}
                onClick={handleLike}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>{likeCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BskyFeedItem
