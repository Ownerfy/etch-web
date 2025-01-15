import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"

interface WavLakeComponentProps {
  match: string
}

function WavLakeComponent({match}: WavLakeComponentProps) {
  const [feedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)

  if (!feedFilter.includes("audio")) return <></>

  return (
    <iframe
      height="380"
      width="100%"
      style={{maxWidth: "100%"}}
      src={`https://embed.wavlake.com/${match}`}
      frameBorder="0"
      loading="lazy"
    />
  )
}

export default WavLakeComponent
