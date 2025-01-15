import SpotifyAlbumComponent from "./SpotifyAlbumComponent.tsx"
import Embed from "../index.ts"

const SpotifyAlbum: Embed = {
  regex: /(?:https?:\/\/)?(?:www\.)?(?:open\.spotify\.com\/album\/)([\w-]+)(?:\S+)?/g,
  settingsKey: "enableSpotify",
  component: ({match}) => <SpotifyAlbumComponent match={match} />,
}

export default SpotifyAlbum
