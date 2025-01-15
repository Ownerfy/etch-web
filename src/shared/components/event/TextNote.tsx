import {NDKEvent} from "@nostr-dev-kit/ndk"

import HyperText from "@/shared/components/HyperText.tsx"
import ErrorBoundary from "../ui/ErrorBoundary"

type TextNoteProps = {
  event: NDKEvent
  truncate?: number
}

function TextNote({event, truncate}: TextNoteProps) {
  return (
    <ErrorBoundary>
      <HyperText event={event} truncate={truncate}>
        {event?.content || ""}
      </HyperText>
    </ErrorBoundary>
  )
}

export default TextNote
