import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useEffect, useState} from "react"
import HyperText from "../HyperText"
import {ndk} from "irisdb-nostr"

interface GemProps {
  event: NDKEvent
}

function Gem({event}: GemProps) {
  const [content, setContent] = useState("")

  useEffect(() => {
    const dTag = event.tagValue("d")
    const eventId = dTag?.split("/gems/")[1]

    if (eventId) {
      ndk()
        .fetchEvent(eventId)
        .then((event: NDKEvent | null) => {
          if (event) {
            setContent(event.content)
          }
        })
    }
  }, [event])

  return <HyperText>{content}</HyperText>
}

export default Gem
