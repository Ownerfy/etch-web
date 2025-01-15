import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"

interface TikTokComponentProps {
  match: string
}

function TikTokComponent({match}: TikTokComponentProps) {
  const [feedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)

  if (!feedFilter.includes("shorts")) return <></>

  return (
    <iframe
      className="tiktok"
      width="605"
      height="400"
      style={{maxWidth: "100%"}}
      src={`https://www.tiktok.com/embed/v2/${match}`}
      frameBorder="1"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export default TikTokComponent
