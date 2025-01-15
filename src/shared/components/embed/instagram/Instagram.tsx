import InstagramComponent from "./InstagramComponent.tsx"
import Embed from "../index.ts"

const Instagram: Embed = {
  regex: /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)((?:p|reel)\/[\w-]{11})(?:\S+)?/g,
  settingsKey: "enableInstagram",
  component: ({match}) => <InstagramComponent match={match} />,
}

export default Instagram
