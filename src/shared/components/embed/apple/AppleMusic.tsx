import AppleMusicComponent from "./AppleMusicComponent.tsx"
import Embed from "../index.ts"

const AppleMusic: Embed = {
  regex: /(?:https?:\/\/)(?:.*?)(music\.apple\.com\/.*)/gi,
  settingsKey: "enableAppleMusic",
  component: ({match}) => <AppleMusicComponent match={match} />,
}

export default AppleMusic
