import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"

interface InstagramComponentProps {
  match: string
}

function InstagramComponent({match}: InstagramComponentProps) {
  const [feedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)

  if (match.includes("instagram.com/reel/") && !feedFilter.includes("shorts"))
    return <></>
  if (match.includes("instagram.com/p/") && !feedFilter.includes("images")) return <></>

  return (
    <iframe
      className="instagram"
      width="650"
      height="400"
      style={{maxWidth: "100%"}}
      src={`https://instagram.com/${match}/embed`}
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export default InstagramComponent
