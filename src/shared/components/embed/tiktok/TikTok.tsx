import TikTokComponent from "./TikTokComponent.tsx"
import Embed from "../index.ts"

const TikTok: Embed = {
  regex: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/.*?video\/(\d{1,19})/g,
  settingsKey: "enableTiktok",
  component: ({match}) => <TikTokComponent match={match} />,
}

export default TikTok
