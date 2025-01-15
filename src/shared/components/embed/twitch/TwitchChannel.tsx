import TwitchChannelComponent from "./TwitchChannelComponent.tsx"
import Embed from "../index.ts"

const Twitch: Embed = {
  regex: /(?:https?:\/\/)?(?:www\.)?(?:twitch\.tv\/)([\w-]+)?/g,
  settingsKey: "enableTwitch",
  component: ({match}) => <TwitchChannelComponent match={match} />,
}

export default Twitch
