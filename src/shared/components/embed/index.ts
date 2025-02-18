import {NDKEvent} from "@nostr-dev-kit/ndk"
import {ReactNode} from "react"

import SpotifyPlaylist from "./spotify/SpotifyPlaylist.tsx"
import SpotifyPodcast from "./spotify/SpotifyPodcast.tsx"
import SmallThumbnail from "./video/SmallThumbnail.tsx"
import TwitchChannel from "./twitch/TwitchChannel.tsx"
import SpotifyAlbum from "./spotify/SpotifyAlbum.tsx"
import SpotifyTrack from "./spotify/SpotifyTrack.tsx"
import InlineMention from "./nostr/InlineMention.tsx"
import SoundCloud from "./soundcloud/SoundCloud.tsx"
import ApplePodcast from "./apple/ApplePodcast.tsx"
import Instagram from "./instagram/Instagram.tsx"
// import TidalPlaylist from "./tidal/TidalPlaylist"
// import TidalTrack from "./tidal/TidalTrack"
import SmallImage from "./images/SmallImage.tsx"
import AppleMusic from "./apple/AppleMusic.tsx"
import IssuePRRef from "./nestr/IssuePRRef.tsx"
import NostrNpub from "./nostr/NostrNpub.tsx"
import LightningUri from "./LightningUri.tsx"
import YouTube from "./youtube/YouTube.tsx"
import WavLake from "./wavlake/WavLake.tsx"
import HlsVideo from "./video/HlsVideo.tsx"
import Twitch from "./twitch/Twitch.tsx"
import TikTok from "./tiktok/TikTok.tsx"
import Image from "./images/Image.tsx"
import Video from "./video/Video.tsx"
import Nip19 from "./nostr/Nip19.tsx"
import Hashtag from "./Hashtag.tsx"
import Twitter from "./Twitter.tsx"
import Audio from "./Audio.tsx"
import Url from "./Url.tsx"

export type EmbedProps = {
  match: string
  index?: number
  event?: NDKEvent
  key: string
}

type Embed = {
  regex: RegExp
  component: (props: EmbedProps) => ReactNode
  settingsKey?: string
}

export const allEmbeds = [
  Audio,
  Image,
  Video,
  HlsVideo,
  YouTube,
  Instagram,
  Twitter,
  SoundCloud,
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyPodcast,
  SpotifyPlaylist,
  AppleMusic,
  ApplePodcast,
  // disable tidal again, it centers the screen on the widget on load...
  // TidalPlaylist,
  // TidalTrack,
  TikTok,
  Twitch,
  TwitchChannel,
  WavLake,
  LightningUri,
  NostrNpub,
  Nip19,
  InlineMention,
  Url,
  Hashtag,
  IssuePRRef,
]

export const mediaEmbeds = [
  Audio,
  Image,
  Video,
  HlsVideo,
  YouTube,
  Instagram,
  Twitter,
  SoundCloud,
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyPodcast,
  SpotifyPlaylist,
  AppleMusic,
  ApplePodcast,
  // disable tidal again, it centers the screen on the widget on load...
  // TidalPlaylist,
  // TidalTrack,
  TikTok,
  Twitch,
  TwitchChannel,
  WavLake,
]

export const textEmbeds = allEmbeds.filter((e) => mediaEmbeds.includes(e))

export const hasMedia = (e: NDKEvent) => {
  for (const embed of mediaEmbeds) {
    if (e.content.match(embed.regex)) {
      return true
    }
  }
  return false
}

export const hasVideo = (e: NDKEvent) => {
  return (
    e.content.match(Video.regex) ||
    e.content.match(HlsVideo.regex) ||
    e.content.match(TikTok.regex)
  )
}

export const smallEmbeds = [NostrNpub, Hashtag, SmallImage, SmallThumbnail, Url]

export default Embed
