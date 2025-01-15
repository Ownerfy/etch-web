import SoundCloudComponent from "./SoundCloudComponent.tsx"
import Embed from "../index.ts"

const SoundCloud: Embed = {
  regex:
    /(?:https?:\/\/)?(?:www\.)?(soundcloud\.com\/(?!live)[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+)(?:\?.*)?/g,
  settingsKey: "enableSoundCloud",
  component: ({match}) => <SoundCloudComponent match={match} />,
}

export default SoundCloud
