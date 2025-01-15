import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"

interface SpotifyTrackComponentProps {
  match: string
}

function SpotifyTrackComponent({match}: SpotifyTrackComponentProps) {
  const [feedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)

  if (!feedFilter.includes("audio")) return <></>

  return (
    <iframe
      scrolling="no"
      width="650"
      height="200"
      src={`https://open.spotify.com/embed/track/${match}?utm_source=oembed`}
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export default SpotifyTrackComponent
