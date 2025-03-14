import {getBskyPostThread, publishNote} from "@/shared/services/BackendServices"
import MiddleHeader from "@/shared/components/header/MiddleHeader"
import BskyFeedItem, {type BskyPost} from "./BskyFeedItem"
import {useParams, useNavigate} from "react-router-dom"
import {useState, useEffect} from "react"
import {toast} from "react-hot-toast"

function BskyComposeReply() {
  const {postId} = useParams<{postId: string}>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BskyPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      if (!postId) return

      setIsLoading(true)
      setError(null)

      try {
        const decodedPostId = decodeURIComponent(postId)
        const response = await getBskyPostThread(decodedPostId)

        if (response?.thread) {
          setPost(response.thread.post ? response.thread : response.thread)
        } else {
          setError("Could not retrieve post details")
        }
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Failed to load post details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  const handleSubmit = async () => {
    if (!replyText.trim() || !postId) {
      toast.error("Please enter a reply")
      return
    }

    setIsSubmitting(true)

    try {
      const decodedPostId = decodeURIComponent(postId)

      // Use your existing publishNote function or create a new one for BlueSky replies
      await publishNote({
        title: "",
        content: replyText,
        uploadedVideo: null,
        isNft: false,
        uploadedImages: [],
        repliedEvent: decodedPostId,
        addLinkBack: false,
        publishOnBlueSky: true,
        quotedEvent: null,
        generatedImageUrl: null,
        bskyReplyUri: null,
        bskyReplyCid: null,
      })

      toast.success("Reply posted successfully")
      navigate(-1) // Go back to the previous page
    } catch (error) {
      console.error("Error posting reply:", error)
      toast.error("Failed to post reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <MiddleHeader title="Reply" onBack={() => navigate(-1)} />

      {isLoading && (
        <div className="p-8 flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {error && <div className="p-4 text-error text-center">{error}</div>}

      {post && (
        <div className="border-b border-custom">
          <BskyFeedItem post={post} />
        </div>
      )}

      <div className="p-4">
        <textarea
          className="textarea textarea-bordered w-full h-32"
          placeholder="Write your reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          disabled={isSubmitting}
        ></textarea>

        <div className="flex justify-end mt-4">
          <button
            className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
            onClick={handleSubmit}
            disabled={isSubmitting || !replyText.trim()}
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  )
}

export default BskyComposeReply
