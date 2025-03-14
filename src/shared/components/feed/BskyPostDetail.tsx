import {getBskyPostThread} from "@/shared/services/BackendServices"
import MiddleHeader from "@/shared/components/header/MiddleHeader"
import BskyFeedItem, {type BskyPost} from "./BskyFeedItem"
import {useParams, useNavigate} from "react-router-dom"
import {useEffect, useState} from "react"

function BskyPostDetail() {
  const {postId} = useParams<{postId: string}>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BskyPost | null>(null)
  const [replies, setReplies] = useState<BskyPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPostThread() {
      if (!postId) return

      setIsLoading(true)
      setError(null)

      try {
        const decodedPostId = decodeURIComponent(postId)
        const response = await getBskyPostThread(decodedPostId)

        if (response?.thread) {
          // The main post is usually in thread.post
          setPost(response.thread.post ? response.thread : response.thread)

          // Extract replies from thread.replies
          const threadReplies = response.thread.replies || []
          setReplies(threadReplies)
        } else {
          setError("Could not retrieve post details")
        }
      } catch (err) {
        console.error("Error fetching post thread:", err)
        setError("Failed to load post details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPostThread()
  }, [postId])

  return (
    <div>
      <MiddleHeader title="Post" backButton onBack={() => navigate(-1)} />

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

      {replies && replies.length > 0 ? (
        <div>
          <div className="px-4 py-2 text-base-content/70 font-medium border-b border-custom">
            Replies
          </div>
          {replies.map((reply, index) => (
            <BskyFeedItem key={`reply-${index}`} post={reply} />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="p-4 text-center text-base-content/50">
            No replies to this post
          </div>
        )
      )}
    </div>
  )
}

export default BskyPostDetail
