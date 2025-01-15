import SmallThumbnailComponent from "./SmallThumbnailComponent.tsx"
import Embed from "../index.ts"

const SmallThumbnail: Embed = {
  regex: /(https?:\/\/\S+?\.(?:mp4|webm|ogg|mov|m3u8)(?:\?\S*)?)/gi,
  settingsKey: "enableSmallThumbnail",
  component: ({match, event}) => <SmallThumbnailComponent match={match} event={event} />,
}

export default SmallThumbnail
