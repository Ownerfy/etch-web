import {useEffect, useState, useCallback} from "react"
import {Link} from "react-router-dom"
import classNames from "classnames"
import {nip19} from "nostr-tools"

import RelativeTime from "@/shared/components/event/RelativeTime.tsx"
import FeedItemDropdown from "../reactions/FeedItemDropdown.tsx"
import {UserRow} from "@/shared/components/user/UserRow.tsx"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import {EVENT_AVATAR_WIDTH} from "../../user/const.ts"
import {NDKEvent} from "@nostr-dev-kit/ndk"

type FeedItemHeaderProps = {
  event: NDKEvent
  repostedEvent?: NDKEvent
  tight?: boolean
}

function FeedItemHeader({event, repostedEvent, tight}: FeedItemHeaderProps) {
  const isRezap = event?.tags
    .filter((tag) => tag[0] === "e")
    .toString()
    .includes("rezap")

  const [publishedAt, setPublishedAt] = useState<number>(0)
  const [showDropdown, setShowDropdown] = useState(false)

  const [dropdownRef, setDropdownRef] = useState<HTMLDivElement | null>(null)
  const [dropdownIconRef, setDropdownIconRef] = useState<HTMLDivElement | null>(null)

  // handle long-form published timestamp
  useEffect(() => {
    const getPublishedAt = (eventData: NDKEvent) => {
      if (eventData && eventData.kind === 30023) {
        const published = eventData.tagValue("published_at")
        if (published) {
          try {
            return Number(published)
          } catch (error) {
            // ignore
          }
        }
      }
      return null
    }

    const publishedAt = repostedEvent
      ? getPublishedAt(repostedEvent)
      : getPublishedAt(event)

    if (publishedAt) setPublishedAt(publishedAt)
  }, [event, repostedEvent])

  const onClose = useCallback(() => setShowDropdown(false), [setShowDropdown])

  // hide dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      if (
        showDropdown &&
        dropdownRef &&
        !dropdownRef.contains(event.target as Node) &&
        dropdownIconRef &&
        !dropdownIconRef?.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("click", handleClickOutsideDropdown)
    return () => {
      document.removeEventListener("click", handleClickOutsideDropdown)
    }
  }, [dropdownRef, dropdownIconRef])

  return (
    <header className={classNames("flex justify-between items-center", {"mb-2": !tight})}>
      {!isRezap && (
        <div className="cursor-pointer font-bold">
          <UserRow
            avatarWidth={EVENT_AVATAR_WIDTH}
            showHoverCard={true}
            pubKey={
              (event.kind === 9735 && event.tagValue("P")
                ? event.tagValue("P")
                : repostedEvent?.pubkey) || event.pubkey
            }
          />
        </div>
      )}
      <div className="select-none flex justify-end items-center">
        <Link
          to={`/${nip19.noteEncode(event.id)}`}
          className="text-sm text-base-content/50 mr-2"
        >
          <RelativeTime
            from={(publishedAt || repostedEvent?.created_at || event.created_at!) * 1000}
          />
        </Link>
        <div
          tabIndex={0}
          role="button"
          className="p-2"
          ref={setDropdownIconRef}
          onClick={(e) => {
            e.stopPropagation()
            setShowDropdown(true)
          }}
        >
          <MoreVertIcon className="h-6 w-6 cursor-pointer text-base-content/50" />
        </div>
        {showDropdown && (
          <div ref={setDropdownRef} className="z-40">
            <FeedItemDropdown onClose={onClose} event={repostedEvent || event} />
          </div>
        )}
      </div>
    </header>
  )
}

export default FeedItemHeader
