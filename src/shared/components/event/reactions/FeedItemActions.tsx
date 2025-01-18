import {NDKEvent} from "@nostr-dev-kit/ndk"

import FeedItemComment from "./FeedItemComment.tsx"
import FeedItemRepost from "./FeedItemRepost.tsx"
import FeedItemShare from "./FeedItemShare.tsx"
import {FeedItemLike} from "./FeedItemLike.tsx"
// import FeedItemZap from "./FeedItemZap.tsx"
import {useLocalState} from "irisdb-hooks"
import classNames from "classnames"

type FeedItemActionsProps = {
  event: NDKEvent
}

function FeedItemActions({event}: FeedItemActionsProps) {
  const [notesTheme] = useLocalState("user/notesTheme", CONFIG.defaultNotesTheme)

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={classNames("py-2 flex flex-row gap-4 z-20", {
        "items-center max-w-full select-none text-base-content/50": notesTheme === "etch",
        "cursor-default bg-gradient-to-b from-primary to-primary/50 px-6 py-1 absolute -bottom-3 -right-0 shadow-xl rounded-full bg-base-100 flex flex-row gap-4 items-center justify-end":
          notesTheme === "nestr",
      })}
    >
      {event.kind !== 30078 && <FeedItemComment event={event} />}
      {event.kind !== 30078 && <FeedItemRepost event={event} />}
      <FeedItemLike event={event} />
      {/* <FeedItemZap event={event} /> */}
      <FeedItemShare event={event} />
    </div>
  )
}

export default FeedItemActions
