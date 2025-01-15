import {useContext, useEffect, useMemo, useState, useRef} from "react"
import {eventsByIdCache, addSeenEventId} from "@/utils/memcache.ts"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import classNames from "classnames"

import {
  getEventReplyingTo,
  isGem,
  isRezap,
  fetchEvent,
  getEventRoot,
} from "@/utils/nostr.ts"
import {getEventIdHex, handleEventContent} from "@/shared/components/event/utils.ts"
import HiddenPostMessage from "@/shared/components/event/HiddenPostMessage.tsx"
import RepostHeader from "@/shared/components/event/RepostHeader.tsx"
import FeedItemActions from "../reactions/FeedItemActions.tsx"
import FeedItemPlaceholder from "./FeedItemPlaceholder.tsx"
import ErrorBoundary from "../../ui/ErrorBoundary.tsx"
import {UserContext} from "@/context/UserContext.tsx"
import Feed from "@/shared/components/feed/Feed.tsx"
import FeedItemContent from "./FeedItemContent.tsx"
import {onClick, TRUNCATE_LENGTH} from "./utils.ts"
import {Link, useNavigate} from "react-router-dom"
import FeedItemHeader from "./FeedItemHeader.tsx"
import FeedItemTitle from "./FeedItemTitle.tsx"
import RezapHeader from "../RezapHeader.tsx"
import {useLocalState} from "irisdb-hooks"
import GemHeader from "../GemHeader.tsx"
import {nip19} from "nostr-tools"

type FeedItemProps = {
  event?: NDKEvent
  eventId?: string
  authorHints?: string[]
  truncate?: number
  standalone?: boolean
  showReplies?: number
  showRepliedTo?: boolean
  showActions?: boolean
  asEmbed?: boolean
  asRepliedTo?: boolean
  asReply?: boolean
  onEvent?: (event: NDKEvent) => void
  borderTop?: boolean
}

function FeedItem({
  event: initialEvent,
  eventId,
  authorHints,
  standalone,
  showReplies = 0,
  truncate = standalone ? 0 : TRUNCATE_LENGTH,
  showRepliedTo = standalone,
  showActions = true,
  asEmbed = false,
  asRepliedTo = false,
  asReply = false,
  onEvent,
  borderTop,
}: FeedItemProps) {
  // make sure to populate useState from cache if possible - avoids flicker & layout shift
  const navigate = useNavigate()

  const eventIdHex = useMemo(() => {
    return getEventIdHex(initialEvent, eventId)
  }, [initialEvent, eventId])

  const [event, setEvent] = useState<NDKEvent | undefined>(
    initialEvent || eventsByIdCache.get(eventIdHex)
  )
  const {mutedList} = useContext(UserContext)
  const [repostedEvent, setRepostedEvent] = useState<NDKEvent>(
    eventsByIdCache.get(eventIdHex)
  )
  const [isPostHidden, setIsPostHidden] = useState<boolean>(false)
  const isAuthorMuted = event && mutedList.includes(event.pubkey)

  const [notesTheme] = useLocalState("user/notesTheme", CONFIG.defaultNotesTheme)

  const toggleViewPost = () => {
    setIsPostHidden(!isPostHidden)
  }

  if (!event && !eventId)
    throw new Error("FeedItem requires either an event or an eventId")

  const repliedToEventId = useMemo(() => event && getEventReplyingTo(event), [event])
  const rootId = useMemo(() => event && getEventRoot(event), [event])
  const showThreadRoot =
    standalone && rootId && rootId !== eventIdHex && rootId !== repliedToEventId

  const feedItemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (event) {
      onEvent?.(event)
    } else {
      return
    }

    if (!event) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const timer = setTimeout(() => {
              addSeenEventId(event.id)
            }, 1000)

            return () => clearTimeout(timer)
          }
        })
      },
      {rootMargin: "-200px 0px 0px 0px"} // Trigger when 200 pixels from the top edge are visible
    )

    if (feedItemRef.current) {
      observer.observe(feedItemRef.current)
    }

    return () => {
      if (feedItemRef.current) {
        observer.unobserve(feedItemRef.current)
      }
    }
  }, [event])

  useEffect(() => {
    if (event) {
      handleEventContent(event, (reposted) => {
        setRepostedEvent(reposted)
        eventsByIdCache.set(eventIdHex, reposted)
      })
    } else {
      fetchEvent({
        ids: [eventIdHex],
        authors: authorHints?.length ? authorHints : undefined,
      }).then((fetchedEvent: NDKEvent | null) => {
        if (fetchedEvent) {
          setEvent(fetchedEvent)
          eventsByIdCache.set(eventIdHex, fetchedEvent)
        }
      })
    }
  }, [eventIdHex])

  if (!event) {
    return (
      <FeedItemPlaceholder
        standalone={standalone}
        asEmbed={asEmbed}
        eventIdHex={eventIdHex}
        onClick={(e) => onClick(e, event, repostedEvent, eventId, navigate)}
      />
    )
  }

  return (
    <ErrorBoundary>
      {showThreadRoot && (
        <div className="px-4 py-2 text-sm text-base-content/70">
          <Link
            to={`/${nip19.noteEncode(rootId)}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:underline"
          >
            View thread root →
          </Link>
        </div>
      )}
      {event.kind === 1 && showRepliedTo && repliedToEventId && !isRezap(event) && (
        <>
          <FeedItem
            borderTop={borderTop}
            asRepliedTo={true}
            eventId={repliedToEventId}
            truncate={truncate}
            onEvent={onEvent}
          />
        </>
      )}
      <div
        ref={feedItemRef}
        className={classNames(
          "flex flex-col border-custom px-4 transition-colors duration-200 ease-in-out relative",
          {
            "pt-3 pb-0": notesTheme === "etch",
            "pt-5 pb-16 hover:relative": notesTheme === "nestr",
            "cursor-pointer": !standalone,
            "border-b": !asRepliedTo && !asEmbed,
            "border-t": !asReply && borderTop,
            "border pt-3 pb-3 my-2 rounded": asEmbed,
            "hover:bg-[var(--note-hover-color)]": !standalone,
          }
        )}
        onClick={(e) =>
          !standalone && onClick(e, event, repostedEvent, eventId, navigate)
        }
      >
        {asRepliedTo && (
          <div className="h-full w-0.5 bg-base-300 absolute top-12 left-9" />
        )}
        {(event.kind === 6 || event.kind === 9372 || isRezap(event) || isGem(event)) && (
          <div className="flex flex-row select-none mb-2">
            {(event.kind === 6 || event.kind === 9372) && <RepostHeader event={event} />}
            {isRezap(event) && <RezapHeader event={event} />}
            {isGem(event) && <GemHeader event={event} />}
          </div>
        )}
        <div className="flex flex-row gap-4 flex-1">
          <div className={classNames("flex-1 w-full", {"text-lg": standalone})}>
            <FeedItemHeader
              event={event}
              repostedEvent={repostedEvent}
              tight={asReply || asRepliedTo}
            />
            <div className={classNames({"pl-12": asReply || asRepliedTo})}>
              {isPostHidden ? (
                <HiddenPostMessage toggleViewPost={toggleViewPost} />
              ) : (
                <FeedItemContent
                  event={event}
                  repostedEvent={repostedEvent}
                  standalone={standalone}
                  truncate={truncate}
                />
              )}
            </div>
          </div>
        </div>
        <div className={classNames({"pl-10": asReply || asRepliedTo})}>
          {showActions && <FeedItemActions event={repostedEvent || event} />}
          {isAuthorMuted && !isPostHidden && (
            <div className="flex justify-center mt-4">
              <button className="btn btn-secondary" onClick={toggleViewPost}>
                Hide Post
              </button>
            </div>
          )}
        </div>
      </div>
      {showReplies > 0 && (eventId || event?.id) && (
        <div className="flex flex-col justify-center">
          <Feed
            showRepliedTo={false}
            asReply={true}
            filters={{"#e": [eventIdHex], kinds: [1]}}
            displayFilterFn={(e: NDKEvent) => getEventReplyingTo(e) === event.id}
            onEvent={onEvent}
            borderTopFirst={false}
            emptyPlaceholder={null}
            showReplies={showReplies}
            showDisplayAsSelector={false}
            displayAs="list"
            showEventsByUnknownUsersButton={!!standalone}
          />
          <FeedItemTitle event={event} />
        </div>
      )}
    </ErrorBoundary>
  )
}

export default FeedItem
