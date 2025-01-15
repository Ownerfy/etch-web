import {LinkExternalIcon} from "@primer/octicons-react"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useEffect, useState} from "react"
import HyperText from "../HyperText"

interface HighlightProps {
  event: NDKEvent
}

function Highlight({event}: HighlightProps) {
  const [link, setLink] = useState<string>("")

  useEffect(() => {
    const rTag = event.tagValue("r")
    // todo: clean URL from trackers
    if (rTag) setLink(rTag)
  }, [event])

  return (
    <div className="flex flex-col gap-1">
      {event.content && (
        <div className="border-l-4 p-2 border-purple-500">
          <HyperText event={event}>{event.content}</HyperText>
        </div>
      )}
      {link && (
        <div className="flex items-center gap-4 p-1 rounded-lg">
          <LinkExternalIcon />
          <HyperText event={event} truncate={10}>
            {link}
          </HyperText>
        </div>
      )}
    </div>
  )
}

export default Highlight
