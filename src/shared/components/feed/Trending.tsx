import InfiniteScroll from "@/shared/components/ui/InfiniteScroll.tsx"
import {NDKEventFromRawEvent, RawEvent} from "@/utils/nostr.ts"
import {useCallback, useState, useMemo, useEffect} from "react"
import useCachedFetch from "@/shared/hooks/useCachedFetch.ts"
import EventBorderless from "../event/EventBorderless"
import FeedItem from "../event/FeedItem/FeedItem"
import socialGraph from "@/utils/socialGraph"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {Link} from "react-router-dom"
import classNames from "classnames"
import {ndk} from "irisdb-nostr"

class NostrBandApi {
  readonly #url = "https://api.nostr.band"
  readonly #supportedLangs = ["en", "de", "ja", "zh", "th", "pt", "es", "fr"]

  trendingProfilesUrl() {
    return `${this.#url}/v0/trending/profiles`
  }

  trendingNotesUrl(lang?: string) {
    return `${this.#url}/v0/trending/notes${lang && this.#supportedLangs.includes(lang) ? `?lang=${lang}` : ""}`
  }

  suggestedFollowsUrl(pubkey: string) {
    return `${this.#url}/v0/suggested/profiles/${pubkey}`
  }

  trendingHashtagsUrl(lang?: string) {
    return `${this.#url}/v0/trending/hashtags${lang && this.#supportedLangs.includes(lang) ? `?lang=${lang}` : ""}`
  }

  trendingVideosUrl(lang?: string) {
    return `${this.#url}/v0/trending/videos${lang && this.#supportedLangs.includes(lang) ? `?lang=${lang}` : ""}`
  }

  trendingImagesUrl(lang?: string) {
    return `${this.#url}/v0/trending/images${lang && this.#supportedLangs.includes(lang) ? `?lang=${lang}` : ""}`
  }
}

type TrendingData = {
  notes?: Array<{event: RawEvent}>
  videos?: Array<{event: RawEvent}>
  images?: Array<{event: RawEvent}>
  hashtags?: Array<{hashtag: string; posts: number}>
}

type TrendingItem = RawEvent | {hashtag: string; posts: number}

type NostrWineResponse = {
  event_id: string
  reactions: number
  replies: number
  reposts: number
  zap_amount: number
  zap_count: number
}

export default function Trending({
  small = true,
  contentType = "notes",
  randomSort = false,
}: {
  small?: boolean
  contentType?: "notes" | "videos" | "images" | "hashtags"
  randomSort?: boolean
}) {
  const api = useMemo(() => new NostrBandApi(), [])
  const lang = useMemo(() => navigator.language.split(/[_-]+/)[0], [])
  const trendingUrl = useMemo(() => {
    switch (contentType) {
      case "videos":
        return api.trendingVideosUrl(lang)
      case "images":
        return api.trendingImagesUrl(lang)
      case "hashtags":
        return api.trendingHashtagsUrl(lang)
      default:
        return api.trendingNotesUrl(lang)
    }
  }, [api, lang, contentType])
  const storageKey = `nostr-band-${trendingUrl}`
  const [displayCount, setDisplayCount] = useState(25)
  const [wineEvents, setWineEvents] = useState<RawEvent[]>([])

  const {
    data: trendingData,
    isLoading,
    error,
  } = useCachedFetch<TrendingData, TrendingItem[]>(
    trendingUrl,
    storageKey,
    useCallback(
      (data: TrendingData) => {
        if (contentType === "hashtags") {
          return data.hashtags || []
        }
        const events = data.notes || data.videos || data.images || []
        return events
          .map((a: {event: RawEvent}) => {
            const ev = a.event
            const ndkEvent = NDKEventFromRawEvent(ev)
            if (!ndkEvent.verifySignature(true)) {
              console.error(`Event with invalid sig\n\n${ev}\n\nfrom ${trendingUrl}`)
              return undefined
            }
            return ev
          })
          .filter((a): a is RawEvent => a !== undefined)
      },
      [contentType, trendingUrl]
    )
  )

  useEffect(() => {
    const fetchWineEvents = async () => {
      try {
        // 1. Fetch trending event IDs from nostr.wine
        // from here https://docs.nostr.wine/api/trending
        const res = await fetch(
          `https://api.nostr.wine/trending?order=reactions&hours=24&limit=${displayCount}`
        )
        if (!res.ok) throw new Error("Failed to fetch from nostr.wine")
        const data: NostrWineResponse[] = await res.json()
        // console.log("Fetched trending events from wine : ", data)

        // 2. Create NDK instance with relay
        const ndkInstance = ndk()
        //await ndkInstance.connect()

        // 3. Fetch full events using their IDs
        const events = await Promise.all(
          data.map(async (item) => {
            const event = await ndkInstance.fetchEvent(item.event_id)
            return event?.rawEvent()
          })
        )

        // 4. Filter valid events and set state
        const validEvents = events.filter((ev): ev is RawEvent => !!ev)
        setWineEvents(validEvents)
      } catch (err) {
        console.error("Error fetching wine events:", err)
      }
    }

    fetchWineEvents()
  }, [displayCount])

  const sortedData = useMemo(() => {
    // if (!wineEvents.length) return []
    // if trendingData then use that
    if (trendingData && trendingData.length > 0) {
      return randomSort ? [...trendingData].sort(() => Math.random() - 0.5) : trendingData
    }
    // TODO: might want to switch this back to trendingData or figure out a more robust solution later
    // Right now we are just getting the trending data from nostr.wine in no order and no hashtags from that
    return randomSort ? [...wineEvents].sort(() => Math.random() - 0.5) : wineEvents
  }, [wineEvents, trendingData, randomSort])

  const loadMore = useCallback(() => {
    setDisplayCount((prevCount) => Math.min(prevCount + 10, sortedData.length))
  }, [sortedData])

  return (
    <InfiniteScroll onLoadMore={loadMore}>
      <div
        className={classNames(
          "flex flex-col",
          {"text-base-content/50": small},
          {"gap-2": small && contentType === "hashtags"},
          {"gap-8": small && contentType !== "hashtags"}
        )}
      >
        {error && !sortedData.length ? (
          <div className="px-4">Error: {`${error}`}</div>
        ) : null}
        {isLoading ? <div className="px-4">Loading...</div> : null}
        {contentType === "hashtags"
          ? sortedData.slice(0, displayCount).map((hashtagObj, index) =>
              "hashtag" in hashtagObj ? (
                <Link
                  key={index}
                  to={`/search/${hashtagObj.hashtag}`}
                  className="font-bold hover:opacity-80"
                >
                  #{hashtagObj.hashtag}
                </Link>
              ) : null
            )
          : sortedData
              .slice(0, displayCount)
              .filter(
                (e: TrendingItem): e is RawEvent =>
                  "pubkey" in e &&
                  !!(e && socialGraph().getFollowersByUser(e.pubkey).size > 0)
              )
              .map(
                (ev, index) =>
                  ev &&
                  (small ? (
                    <EventBorderless key={index} event={ev as RawEvent} />
                  ) : (
                    <FeedItem key={index} event={new NDKEvent(ndk(), ev as RawEvent)} />
                  ))
              )}
      </div>
    </InfiniteScroll>
  )
}
