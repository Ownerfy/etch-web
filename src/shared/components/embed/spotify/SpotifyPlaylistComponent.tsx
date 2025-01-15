import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"

interface SpotifyPlaylistComponentProps {
  match: string
}

function SpotifyPlaylistComponent({match}: SpotifyPlaylistComponentProps) {
  const [feedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)

  if (!feedFilter.includes("audio")) return <></>

  return (
    <iframe
      className="applemusic"
      scrolling="no"
      width="650"
      height="150"
      style={{maxWidth: "100%"}}
      src={`https://embed.music.apple.com/${match}`}
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export default SpotifyPlaylistComponent
