import {RiVideoLine} from "@remixicon/react"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useState, MouseEvent} from "react"
import classNames from "classnames"
import {localState} from "irisdb"

interface SmallThumbnailComponentProps {
  match: string
  event: NDKEvent | undefined
}

function SmallThumbnailComponent({match, event}: SmallThumbnailComponentProps) {
  let blurNSFW = true
  localState.get("settings/blurNSFW").on((value) => {
    if (typeof value === "boolean") {
      blurNSFW = value
    }
  })

  const [blur, setBlur] = useState(
    blurNSFW &&
      (!!event?.content.toLowerCase().includes("#nsfw") ||
        event?.tags.some((t) => t[0] === "content-warning"))
  )
  const [error, setError] = useState(false)

  const onClick = (e: MouseEvent) => {
    if (blur) {
      setBlur(false)
      e.stopPropagation()
    }
  }

  return (
    <div className="relative w-12 h-12 object-contain my-2">
      {error ? (
        <RiVideoLine className="w-12 h-12" />
      ) : (
        // <img TODO: bring this back when proxy server is up
        //   onClick={onClick}
        //   onError={() => setError(true)}
        //   className={classNames("rounded w-24 h-24", {"blur-xl": blur})}
        //   src={`https://imgproxy.etch.social/thumbnail/192/${match}`}
        //   alt="thumbnail"
        // />
        <img
          onClick={onClick}
          onError={() => setError(true)}
          className={classNames("rounded w-24 h-24", {"blur-xl": blur})}
          src={match}
          alt="thumbnail"
        />
      )}
    </div>
  )
}

export default SmallThumbnailComponent
