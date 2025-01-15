import VideoComponent from "./VideoComponent.tsx"
import Embed from "../index.ts"

const Video: Embed = {
  regex: /(https?:\/\/\S+?\.(?:mp4|webm|ogg|mov)(?:\?\S*)?)/gi,
  settingsKey: "enableVideo",
  component: ({match, event}) => <VideoComponent match={match} event={event} />,
}

export default Video
