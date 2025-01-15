import ApplePodcastComponent from "./ApplePodcastComponent.tsx"
import Embed from "../index.ts"

const ApplePodcast: Embed = {
  regex: /(?:https?:\/\/)(?:.*?)(music\.apple\.com\/.*)/gi,
  settingsKey: "enableAppleMusic",
  component: ({match}) => <ApplePodcastComponent match={match} />,
}

export default ApplePodcast
