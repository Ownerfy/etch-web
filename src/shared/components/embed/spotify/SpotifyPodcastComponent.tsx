import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"

interface SpotifyPodcastComponentProps {
  match: string
}

function SpotifyPodcastComponent({match}: SpotifyPodcastComponentProps) {
  const [feedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)

  if (!feedFilter.includes("audio")) return <></>

  return (
    <iframe
      scrolling="no"
      width="650"
      height="200"
      style={{maxWidth: "100%"}}
      src={`https://open.spotify.com/embed/episode/${match}`}
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export default SpotifyPodcastComponent
