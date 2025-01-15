import SpotifyPodcastComponent from "./SpotifyPodcastComponent.tsx"
import Embed from "../index.ts"

const SpotifyPodcast: Embed = {
  regex:
    /(?:https?:\/\/)?(?:www\.)?(?:open\.spotify\.com\/episode\/)([\w-]+)(?:\S+)?(?:t=(\d+))?/g,
  settingsKey: "enableSpotify",
  component: ({match}) => <SpotifyPodcastComponent match={match} />,
}

export default SpotifyPodcast
