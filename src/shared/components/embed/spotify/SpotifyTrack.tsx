import SpotifyTrackComponent from "./SpotifyTrackComponent.tsx"
import Embed from "../index.ts"

const SpotifyTrack: Embed = {
  regex: /(?:https?:\/\/)?(?:www\.)?(?:open\.spotify\.com\/track\/)([\w-]+)(?:\S+)?/g,
  settingsKey: "enableSpotify",
  component: ({match}) => <SpotifyTrackComponent match={match} />,
}

export default SpotifyTrack
