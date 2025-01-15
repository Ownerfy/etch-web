import TwitchComponent from "./TwitchChannelComponent.tsx"
import Embed from "../index.ts"

const Twitch: Embed = {
  regex: /(?:https?:\/\/)?(?:www\.)?(?:twitch\.tv\/videos\/)([\d]+)?/g,
  settingsKey: "enableTwitch",
  component: ({match}) => <TwitchComponent match={match} />,
}

export default Twitch
