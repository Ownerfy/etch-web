import InfiniteScroll from "@/shared/components/ui/InfiniteScroll.tsx"
import {getBskyPopularPosts} from "@/shared/services/BackendServices"
import {useCallback, useState, useEffect} from "react"
import {useLocalState} from "irisdb-hooks"
import BskyFeedItem from "./BskyFeedItem"
import classNames from "classnames"
import Widget from "../ui/Widget"

export default function BskyTrending({
  small = true,
  standalone = false,
}: {
  small?: boolean
  standalone?: boolean
}) {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [, setError] = useState<Error | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [displayCount, setDisplayCount] = useState(small ? 5 : 10)
  const [bskyData] = useLocalState("user/bskyData", null)
  const isLoggedIn = !!bskyData

  const fetchPosts = useCallback(
    async (nextCursor?: string | null) => {
      if (!isLoggedIn) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await getBskyPopularPosts(nextCursor)

        if (response && response.feed) {
          if (nextCursor) {
            setPosts((prev) => [...prev, ...response.feed])
          } else {
            setPosts(response.feed)
          }

          setCursor(response.cursor)
          setHasMore(!!response.cursor)
        } else {
          setHasMore(false)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch BlueSky trending posts")
        )
        console.error("Error fetching BlueSky trending posts:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoggedIn]
  )

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchPosts(cursor)
      setDisplayCount((prev) => prev + (small ? 5 : 10))
    }
  }, [isLoading, hasMore, cursor, fetchPosts, small])

  const content = (
    <InfiniteScroll onLoadMore={loadMore}>
      <div
        className={classNames(
          "flex flex-col text-base-content/50",
          {"gap-8": small},
          {"gap-4": !small}
        )}
      >
        {!isLoggedIn ? (
          <div className="px-4 py-2 text-center text-base-content/50">
            Connect BlueSky
          </div>
        ) : (
          <>
            {isLoading && !posts.length ? (
              <div className="px-4 text-base-content/50">Loading posts...</div>
            ) : null}

            {posts.slice(0, displayCount).map((post, index) => (
              <BskyFeedItem key={index} post={post} small={small} />
            ))}

            {isLoading && posts.length > 0 && (
              <div className="px-4 py-2 text-center text-base-content/50">
                Loading more...
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="px-4 py-2 text-center text-base-content/50">
                No more posts
              </div>
            )}
          </>
        )}
      </div>
    </InfiniteScroll>
  )

  if (standalone) {
    return content
  }

  return <Widget title="BlueSky Trending">{content}</Widget>
}
