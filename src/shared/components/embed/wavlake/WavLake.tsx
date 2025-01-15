import WavLakeComponent from "./WavLakeComponent.tsx"
import Embed from "../index.ts"

const WavLake: Embed = {
  regex:
    /https:\/\/(?:player\.)?wavlake\.com\/(?!feed\/|artists)(track\/[.a-zA-Z0-9-]+|album\/[.a-zA-Z0-9-]+|[.a-zA-Z0-9-]+)/i,
  settingsKey: "enableWavLake",
  component: ({match}) => <WavLakeComponent match={match} />,
}

export default WavLake
