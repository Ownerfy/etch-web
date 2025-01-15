import Embed from "./index.ts"

const Audio: Embed = {
  regex: /(https?:\/\/\S+\.(?:mp3|wav|ogg|flac)(?:\?\S*)?)\b/gi,
  settingsKey: "enableAudio",
  component: ({match}) => {
    return <audio className="my-2" src={match} controls={true} loop={true} />
  },
}

export default Audio
