import {getBskyTimeline, getBskyLatestPosts} from "@/shared/services/BackendServices"
import InfiniteScroll from "@/shared/components/ui/InfiniteScroll"
import {useEffect, useState, useRef, type ReactNode} from "react"
import BskyFeedItem from "@/shared/components/feed/BskyFeedItem"
import {onAuthStateChanged} from "firebase/auth"
import {auth} from "@/shared/services/firebase"
import {useLocalState} from "irisdb-hooks"

// Updated interface to match API response
interface BskyFeedProps {
  emptyPlaceholder?: ReactNode
  feedType?: "timeline" | "latest"
}

const DefaultEmptyPlaceholder = (
  <div className="p-8 flex flex-col gap-8 items-center justify-center text-base-content/50">
    No posts yet
  </div>
)

function BskyFeed({
  emptyPlaceholder = DefaultEmptyPlaceholder,
  feedType = "timeline",
}: BskyFeedProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const initialLoadDone = useRef(false)
  const seenPostIds = useRef(new Set<string>())
  const [isUserLoaded, setIsUserLoaded] = useState(false)
  const [bskyDid] = useLocalState("bsky/did", "")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoaded(true)
      if (user) {
        // Clear stored post IDs when user changes
        seenPostIds.current.clear()
        // Only fetch posts if user has connected their BlueSky account
        if (feedType === "latest" || bskyDid) {
          fetchPosts()
        }
      }
    })

    return () => {
      unsubscribe()
      seenPostIds.current.clear()
    }
  }, [feedType, bskyDid])

  useEffect(() => {
    // Reset state when feedType changes
    setPosts([])
    setCursor(null)
    setHasMore(true)
    seenPostIds.current.clear()
    initialLoadDone.current = false

    // Only fetch if user is authenticated
    if (auth.currentUser) {
      fetchPosts()
    }
  }, [feedType, bskyDid])

  const fetchPosts = async (cursorParam: string | null = null) => {
    if (!auth.currentUser || isLoading) return

    // Only require bskyDid for timeline feed
    if (feedType === "timeline" && !bskyDid) return

    setIsLoading(true)
    setError(null)

    try {
      // Use the appropriate service function based on feedType
      const response =
        feedType === "latest"
          ? await getBskyLatestPosts(cursorParam)
          : await getBskyTimeline(cursorParam)

      // console.log("BlueSky data:", response)

      if (response && response.feed && Array.isArray(response.feed)) {
        // Filter out already seen posts to prevent duplicates
        const newPosts = response.feed.filter((item: any) => {
          const postId = item?.post?.cid || item?.post?.uri
          if (!postId || seenPostIds.current.has(postId)) {
            return false
          }
          seenPostIds.current.add(postId)
          return true
        })

        // If we got new posts, add them to our state
        if (newPosts.length > 0) {
          setPosts((prevPosts) => [...prevPosts, ...newPosts])
          setCursor(response.cursor || null)
          setHasMore(!!response.cursor)
        } else {
          // If no new posts were found even with a valid cursor, we've reached the end
          // console.log("No new posts found, ending pagination")
          setHasMore(false)
        }
      } else {
        console.warn("Unexpected response format from BlueSky API:", response)
        setHasMore(false)
        if (!posts.length) {
          setError("Received invalid response format from BlueSky")
        }
      }
      initialLoadDone.current = true
    } catch (err) {
      setError("Failed to load BlueSky timeline. Please try again later.")
      console.error("Error fetching BlueSky timeline:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreItems = () => {
    if (!isLoading && hasMore && cursor) {
      fetchPosts(cursor)
    }
  }

  // Show loading state while waiting for auth state
  if (!isUserLoaded) {
    return (
      <div className="p-8 flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  // Show error if no user is found
  if (!auth.currentUser && isUserLoaded) {
    return (
      <div className="p-4 text-error text-center">
        Please sign in to view the BlueSky timeline
      </div>
    )
  }

  // Show message if user hasn't connected their BlueSky account
  if (!bskyDid && auth.currentUser) {
    return (
      <div className="p-8 flex flex-col gap-4 items-center justify-center text-base-content/70">
        <p className="text-center">
          You need to connect your BlueSky account to view this feed.
        </p>
        <p className="text-center">
          Go to Settings &gt; Account to connect your BlueSky account.
        </p>
        <p className="text-center text-sm">
          If you don&apos;t have a BlueSky account, you&apos;ll need to create one at{" "}
          <a
            href="https://bsky.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Bsky.app
          </a>{" "}
          first.
        </p>
      </div>
    )
  }

  return (
    <div>
      {error && <div className="p-4 text-error text-center">{error}</div>}

      {posts.length > 0 ? (
        <InfiniteScroll onLoadMore={loadMoreItems}>
          {posts.map((feedItem, index) => (
            <BskyFeedItem key={feedItem?.post?.cid || `post-${index}`} post={feedItem} />
          ))}
          {isLoading && (
            <div className="p-4 text-center">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}
          {!hasMore && (
            <div className="p-4 text-center text-base-content/50">
              You&apos;ve reached the end of the feed
            </div>
          )}
        </InfiniteScroll>
      ) : (
        <>
          {isLoading && (
            <div className="p-8 flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
          {!isLoading && initialLoadDone.current && emptyPlaceholder}
        </>
      )}
    </div>
  )
}

export default BskyFeed
