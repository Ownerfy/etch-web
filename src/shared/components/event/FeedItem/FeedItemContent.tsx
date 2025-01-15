import PermissionNotification from "../PermissionNotification.tsx"
import QuotedNestrEvent from "../QuotedNestrEvent.tsx"
import {isIssue, isPR, isGem} from "@/utils/nostr.ts"
import IssueFeedItem from "../IssueFeedItem.tsx"
import RepostedEvent from "../RepostedEvent.tsx"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import PRFeedItem from "../PRFeedItem.tsx"
import ZapReceipt from "../ZapReceipt.tsx"
import Zapraiser from "../Zapraiser.tsx"
import Highlight from "../Highlight.tsx"
import LongForm from "../LongForm.tsx"
import TextNote from "../TextNote.tsx"
import Gem from "../Gem.tsx"
import {memo} from "react"

type ContentProps = {
  event: NDKEvent | undefined
  repostedEvent: NDKEvent | undefined
  standalone?: boolean
  truncate: number
}

const FeedItemContent = ({event, repostedEvent, standalone, truncate}: ContentProps) => {
  if (!event) {
    return ""
  }
  if (isIssue(event)) {
    return <IssueFeedItem event={event} />
  } else if (isPR(event)) {
    return <PRFeedItem event={event} />
  } else if (isGem(event)) {
    return <Gem event={event} />
  } else if (event.kind === 16629) {
    return <PermissionNotification event={event} />
  } else if (repostedEvent) {
    return <RepostedEvent repostedEvent={repostedEvent} />
  } else if (event.kind === 9373) {
    return <QuotedNestrEvent event={event} />
  } else if (event.kind === 9735) {
    return <ZapReceipt event={event} />
  } else if (event.kind === 1 && event.tagValue("zapraiser")) {
    return <Zapraiser event={event} />
  } else if (event.kind === 9802) {
    return <Highlight event={event} />
  } else if (event.kind === 30023) {
    return <LongForm event={event} standalone={standalone} />
  } else {
    return <TextNote event={event} truncate={truncate} />
  }
}

export default memo(FeedItemContent)
