import {NDKFilter, NDKEvent} from "@nostr-dev-kit/ndk"
import Feed from "@/shared/components/feed/Feed.tsx"
import {useMemo} from "react"

interface NotesTabProps {
  pubKey: string
  filters?: NDKFilter
  displayFilterFn?: (event: NDKEvent) => boolean
  showRepliedTo?: boolean
}

function NotesTab({
  pubKey,
  filters,
  displayFilterFn,
  showRepliedTo = false,
}: NotesTabProps) {
  // memoize so it doesn't change and cause reinit of feed
  const myFilters: NDKFilter = useMemo(
    () =>
      filters || {
        kinds: [1, 6],
        authors: [pubKey || ""],
      },
    [pubKey]
  )

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex-1">
        <Feed
          showRepliedTo={showRepliedTo}
          filters={myFilters}
          displayFilterFn={displayFilterFn}
          borderTopFirst={true}
        />
      </div>
    </div>
  )
}

export default NotesTab
