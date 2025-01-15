import HlsVideoComponent from "./HlsVideoComponent.tsx"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import Embed from "../index.ts"

const HlsVideo: Embed = {
  regex: /(https?:\/\/\S+?\.m3u8(?:\?\S*)?)/gi,
  settingsKey: "enableHlsVideo",
  component: ({match, event}: {match: string; event?: NDKEvent}) => (
    <HlsVideoComponent match={match} event={event} />
  ),
}

export default HlsVideo
