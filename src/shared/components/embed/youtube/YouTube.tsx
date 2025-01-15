import YoutubeComponent from "./YoutubeComponent.tsx"
import Embed from "../index.ts"

const YouTube: Embed = {
  regex:
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})(?:\S+)?/g,
  settingsKey: "enableYoutube",
  component: ({match}) => <YoutubeComponent match={match} />,
}

export default YouTube
