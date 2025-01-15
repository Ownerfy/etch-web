import EventBorderless from "@/shared/components/event/EventBorderless"
import InfiniteScroll from "@/shared/components/ui/InfiniteScroll"
import {useCallback, useEffect, useMemo, useState} from "react"
import {Diamond} from "@mui/icons-material"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {usePublicState} from "irisdb-hooks"
import {nip19} from "nostr-tools"
import {ndk} from "irisdb-nostr"

interface GemsProps {
  pubKey: string
}

function Gems({pubKey}: GemsProps) {
  const authors = useMemo(() => {
    try {
      return pubKey ? [nip19.decode(pubKey).data.toString()] : []
    } catch (error) {
      console.error("Failed to decode pubKey:", error)
      return []
    }
  }, [pubKey])

  const [gemIds] = usePublicState(authors, "user/gems", {})

  const [events, setEvents] = useState<NDKEvent[]>()

  const [displayCount, setDisplayCount] = useState(10)

  const loadMore = useCallback(() => {
    setDisplayCount(Math.min(displayCount + 10, events?.length || 10))
  }, [displayCount])

  const nonRemovedGemIds = useMemo(() => {
    return Object.values(gemIds).filter((id) => id !== "gem removed") as string[]
  }, [gemIds])

  useEffect(() => {
    ndk()
      .fetchEvents({ids: nonRemovedGemIds})
      .then((gems) => {
        if (gems) setEvents([...gems])
      })
  }, [nonRemovedGemIds])

  // display Gems section only if the user has Gems
  if (!Array.from(Object.keys(gemIds)).length) return null

  return (
    <div className="flex flex-col p-3 rounded-lg">
      <h1 className="flex text-2xl font-bold mt-4 mb-6 items-center gap-2">
        <Diamond className="w-8 h-8" /> Gems
      </h1>
      <InfiniteScroll onLoadMore={loadMore}>
        <div className="flex flex-col gap-8 text-base-content/80">
          {events &&
            events?.length > 0 &&
            events
              .slice(0, displayCount)
              .map((gem, index) => <EventBorderless key={index} event={gem} />)}
        </div>
      </InfiniteScroll>
    </div>
  )
}

export default Gems
