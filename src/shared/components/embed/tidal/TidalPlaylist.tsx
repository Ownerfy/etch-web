import TidalPlaylistComponent from "./TidalPlaylistComponent.tsx"
import Embed from "../index.ts"

const TidalPlaylist: Embed = {
  regex: /(?:https?:\/\/)?(?:www\.)?tidal\.com(?:\/browse)?\/playlist\/([\w\d-]+)/g,
  settingsKey: "enableTidal",
  component: ({match}) => <TidalPlaylistComponent match={match} />,
}

export default TidalPlaylist
