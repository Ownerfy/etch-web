import {getEventReplyingTo, isQuote, isIssue, isPR} from "@/utils/nostr"
import imageEmbed from "@/shared/components/embed/images/Image"
import Video from "@/shared/components/embed/video/Video"
import {hasMedia} from "@/shared/components/embed"
import {NDKEvent} from "@nostr-dev-kit/ndk"

export const kindsByFilter: {[key: string]: number[]} = {
  notes: [1],
  replies: [1],
  reposts: [6, 9372],
  quotes: [1, 9373],
  highlights: [9802],
  "long-form": [30023],
  images: [1],
  videos: [1],
  gifs: [1],
  audio: [1],
  shorts: [1],
  issues: [30078],
  prs: [30078],
  stars: [30078],
}

export const fnByFilter: {[key: string]: (e: NDKEvent) => boolean} = {
  notes: (e) => e.kind === 1,
  replies: (e) => !!getEventReplyingTo(e),
  videos: (e) => !!e.content.match(Video.regex),
  images: (e) => !!e.content.match(imageEmbed.regex),
  "text-only": (e) => !hasMedia(e),
  quotes: (e) => isQuote(e),
  issues: (e) => isIssue(e),
  prs: (e) => isPR(e),
}

export function widgetFilterKinds(widgetFilter: string[]): number[] {
  const kinds = new Set<number>()
  widgetFilter.forEach((f) => kindsByFilter[f]?.forEach((k) => kinds.add(k)))
  return [...kinds]
}
