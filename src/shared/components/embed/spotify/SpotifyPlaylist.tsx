import SpotifyPlaylistComponent from "./SpotifyPlaylistComponent.tsx"
import Embed from "../index.ts"

const SpotifyPlaylist: Embed = {
  regex: /(?:https?:\/\/)(?:.*?)(music\.apple\.com\/.*)/gi,
  settingsKey: "enableSpotify",
  component: ({match}) => <SpotifyPlaylistComponent match={match} />,
}

export default SpotifyPlaylist
