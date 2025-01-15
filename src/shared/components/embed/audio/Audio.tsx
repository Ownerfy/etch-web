import AudioComponent from "./AudioComponent.tsx"
import Embed from "../index.ts"

const Audio: Embed = {
  regex: /(https?:\/\/\S+\.(?:mp3|wav|ogg|flac))\b/gi,
  settingsKey: "enableAudio",
  component: ({match}) => <AudioComponent match={match} />,
}

export default Audio
