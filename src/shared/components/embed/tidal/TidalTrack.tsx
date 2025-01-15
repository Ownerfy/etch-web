import TidalTrackComponent from "./TidalTrackComponent.tsx"
import Embed from "../index.ts"

const TidalTrack: Embed = {
  regex: /(?:https?:\/\/)?(?:www\.)?(?:tidal\.com(?:\/browse)?\/track\/)([\d]+)?/g,
  settingsKey: "enableTidal",
  component: ({match}) => <TidalTrackComponent match={match} />,
}

export default TidalTrack
