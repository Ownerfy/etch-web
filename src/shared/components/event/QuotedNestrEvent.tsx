import {NDKEvent} from "@nostr-dev-kit/ndk"
import {Fragment} from "react"

type QuotedNestrEventProps = {
  event: NDKEvent
}

// todo: render original event based on q tag (event.id)
function QuotedNestrEvent({event}: QuotedNestrEventProps) {
  const noteLines = event?.content.split("\n")

  return (
    <>
      <div className="TextNote-container">
        <p className="TextNote-text">
          {noteLines &&
            noteLines.map((line: string, index: number) => (
              <Fragment key={index}>
                {line}
                {index !== noteLines.length - 1 && <br />}
              </Fragment>
            ))}
        </p>
      </div>
    </>
  )
}

export default QuotedNestrEvent
