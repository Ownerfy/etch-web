import {useState} from "react"

import InfiniteScroll from "@/shared/components/ui/InfiniteScroll.tsx" // Make sure to import InfiniteScroll
import ProfileCard from "@/shared/components/user/ProfileCard"
import useFollows from "@/shared/hooks/useFollows"

interface FollowListProps {
  follows?: string[]
  pubKey?: string
  initialDisplayCount?: number
  showAbout?: boolean
}

function FollowList({
  follows,
  pubKey = "",
  initialDisplayCount = 10,
  showAbout = false,
}: FollowListProps) {
  const [displayCount, setDisplayCount] = useState<number>(initialDisplayCount) // Start by displaying 10 items
  const f = useFollows(pubKey)

  if (!pubKey && !follows) {
    throw new Error("FollowList needs follows or pubKey param")
  }

  const localFollows = follows || f

  const loadMoreFollows = () => {
    if (displayCount < localFollows.length) {
      setDisplayCount((prevCount) =>
        Math.min(prevCount + initialDisplayCount * 2, localFollows.length)
      ) // Load 10 more items at a time
    }
  }

  return (
    <>
      <InfiniteScroll onLoadMore={loadMoreFollows}>
        <div className="flex flex-col gap-2">
          {localFollows.slice(0, displayCount).map((pubkey) => (
            <ProfileCard key={pubKey} pubKey={pubkey} showAbout={showAbout} />
          ))}
        </div>
      </InfiniteScroll>
    </>
  )
}

export default FollowList
