import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"
import {useMemo} from "react"

interface YoutubeComponentProps {
  match: string
}

function YoutubeComponent({match}: YoutubeComponentProps) {
  const [feedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)
  const [youtubePrivacyMode] = useLocalState(
    "settings/youtubePrivacyMode",
    CONFIG.defaultSettings.youtubePrivacyMode
  )

  const invidiousDomain = useMemo(() => {
    const domains = ["inv.nadeko.net", "invidious.privacyredirect.com"]
    return domains[Math.floor(Math.random() * domains.length)]
  }, [match])

  if (!feedFilter.includes("videos")) return <></>

  return (
    <iframe
      className="max-w-full rounded-sm"
      width="650"
      height="400"
      src={`https://${youtubePrivacyMode ? invidiousDomain : "youtube.com"}/embed/${match}`}
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export default YoutubeComponent
