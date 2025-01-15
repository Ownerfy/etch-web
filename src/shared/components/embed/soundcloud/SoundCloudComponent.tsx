import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"

interface SoundCloudComponentProps {
  match: string
}

function SoundCloudComponent({match}: SoundCloudComponentProps) {
  const [feedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)

  if (!feedFilter.includes("audio")) return <></>

  return (
    <iframe
      scrolling="no"
      width="650"
      height="380"
      style={{maxWidth: "100%"}}
      src={`https://w.soundcloud.com/player/?url=${match}`}
      frameBorder="0"
      allow="encrypted-media"
    />
  )
}

export default SoundCloudComponent
