import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"

interface TwitchChannelComponentProps {
  match: string
}

function TwitchComponent({match}: TwitchChannelComponentProps) {
  const [feedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)

  if (!feedFilter.includes("videos")) return <></>

  return (
    <iframe
      className="video"
      scrolling="no"
      width="650"
      height="400"
      style={{maxWidth: "100%"}}
      src={`https://player.twitch.tv/?channel=${match}&parent=${window.location.hostname}&autoplay=false`}
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export default TwitchComponent
