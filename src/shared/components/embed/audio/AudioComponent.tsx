import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"

interface AudioComponentProps {
  match: string
}

function AudioComponent({match}: AudioComponentProps) {
  const [feedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)

  if (!feedFilter.includes("audio")) return <></>

  return <audio src={match} controls={true} loop={true} />
}

export default AudioComponent
