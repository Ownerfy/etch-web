import {NDKEvent} from "@nostr-dev-kit/ndk"

import IssueFeedItem from "./IssueFeedItem.tsx"
import {isIssue} from "@/utils/nostr.ts"
import TextNote from "./TextNote.tsx"

interface RepostedEventProps {
  repostedEvent: NDKEvent
}

function RepostedEvent({repostedEvent}: RepostedEventProps) {
  if (repostedEvent && repostedEvent.kind === 1) {
    return <TextNote event={repostedEvent} truncate={300} />
  }
  if (repostedEvent && isIssue(repostedEvent)) {
    return <IssueFeedItem event={repostedEvent} />
  }

  return (
    <div className="TextNote-container">
      <p>The note is loading or cannot be found on your relay list.</p>
    </div>
  )
}

export default RepostedEvent
