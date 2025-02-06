import {
  NDKEvent,
  NDKFilter,
  NDKRelayList,
  NDKTag,
  NDKUserProfile,
} from "@nostr-dev-kit/ndk"
import {eventRegex} from "@/shared/components/embed/nostr/NostrNote"
import {Dispatch, useEffect, useMemo, useState} from "react"
import {Notification} from "@/utils/notifications"
import {nip19} from "nostr-tools"
import {ndk} from "irisdb-nostr"
import * as bolt11 from "bolt11"

export const defaultFeedFilter = [
  "notes",
  "reposts",
  "quotes",
  "rezaps",
  "gems",
  "issues",
  "pull-requests",
  "text-only",
  "images",
  "videos",
  "gifs",
  "audio",
  "shorts",
  "long-form",
  "highlights",
]
export const defaultNotificationsFilter = [
  6927, // generic Nestr notification
  16629, // repo write-access permission
  7, // reactions
  "git-comments",
  6, // reposts
  "quotes",
  1, // replies
  9372, // git reposts
  9373, // git quotes
  "rezaps",
  9735, // zap receipts
  9802, // highlights
  "issues",
  "pull-requests",
  "git-assigns",
  "review-requests",
]

export const ISSUE_REGEX =
  /^\/apps\/git\/repos\/[a-zA-Z0-9_-]+\/issues\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/title$/

export const PR_REGEX =
  /^\/apps\/git\/repos\/[a-zA-Z0-9_-]+\/pull-requests\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/title$/

// ref format: uuid:type:pubKey:repoId // (issue_pr_uuid):(i|p):(issue_pr_author):(repositoryId)
export const ISSUE_PR_REF_REGEX =
  /((?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):(?:i|p):(?:[0-9a-f]{64}):(?:[a-zA-Z0-9]*))/g

// turn a UNIX timestamp into "dd/mm/yyyy hh:mm"
export function formatUnixTimestamp(timestamp: number): string {
  const now = new Date()
  const date = new Date(timestamp * 1000) // Convert seconds to milliseconds

  const monthAbbreviations = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInYears = now.getFullYear() - date.getFullYear()

  if (diffInYears >= 1) {
    // More than a year old, return "dd Jan 2023"
    const day = String(date.getDate()).padStart(2, "0")
    const month = monthAbbreviations[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  } else if (diffInDays >= 1) {
    // Less than a year old but more than 24 hours, return "Dec 05"
    const day = String(date.getDate()).padStart(2, "0")
    const month = monthAbbreviations[date.getMonth()]
    return `${month} ${day}`
  } else if (diffInHours >= 1) {
    if (diffInHours === 1) return "1 hour ago"
    // Less than 24 hours old but more than 1 hour, return "x hours ago"
    return `${diffInHours} hours ago`
  } else if (diffInMinutes >= 1) {
    if (diffInMinutes === 1) return "1 minute ago"
    // Less than an hour old but more than 1 minute, return "x minutes ago"
    return `${diffInMinutes} minutes ago`
  } else {
    // Less than a minute old
    return "just now"
  }
}

export function getRepostedEventId(event: NDKEvent) {
  let id = event.tags?.find((tag) => tag[0] === "e" && tag[3] === "mention")?.[1]
  if (id) {
    return id
  }
  // last e tag is the reposted post
  id = event.tags
    .slice() // so we don't reverse event.tags in place
    .reverse()
    .find((tag: NDKTag) => tag[0] === "e")?.[1]
  return id
}
export function getOriginalPostEventId(event: NDKEvent) {
  return isRepost(event) ? getRepostedEventId(event) : event.id
}
export function getNoteReplyingTo(event: NDKEvent) {
  if (event.kind !== 1) {
    return undefined
  }
  return getEventReplyingTo(event)
}
export function getEventReplyingTo(event: NDKEvent) {
  if (event.kind !== 1) {
    return undefined
  }
  const replyTags = event.tags?.filter((tag) => tag[0] === "e" && tag[3] !== "mention")
  if (replyTags.length === 1) {
    return replyTags[0][1]
  }
  const replyTag = event.tags?.find((tag) => tag[0] === "e" && tag[3] === "reply")
  if (replyTag) {
    return replyTag[1]
  }
  if (replyTags.length > 1) {
    return replyTags[1][1]
  }
  return undefined
}

export function hasEtchTag(event: NDKEvent) {
  return event.tags?.some((tag) => tag[0] === "l" && tag[1] === "app-etch")
}

export async function fetchEvent(filter: NDKFilter): Promise<NDKEvent> {
  return new Promise((resolve) => {
    const sub = ndk().subscribe(filter)
    sub.on("event", (event) => {
      sub.stop()
      resolve(event)
    })
  })
}

export function isRepost(event: NDKEvent) {
  if (event.kind === 6) {
    return true
  }
  const mentionIndex = event.tags?.findIndex(
    (tag) => tag[0] === "e" && tag[3] === "mention"
  )
  if (event.kind === 1 && event.content === `#[${mentionIndex}]`) {
    return true
  }
  return false
}

export function getZappingUser(event: NDKEvent, npub = true) {
  const description = event.tags?.find((t) => t[0] === "description")?.[1]
  if (!description) {
    return null
  }
  let obj
  try {
    obj = JSON.parse(description)
  } catch (e) {
    return null
  }
  if (npub) {
    nip19.npubEncode(obj.pubkey)
  }
  return obj.pubkey
}

export function getZapAmount(event: NDKEvent) {
  const invoice = event.tagValue("bolt11")
  if (invoice) {
    const decodedInvoice = bolt11.decode(invoice)
    if (decodedInvoice.complete && decodedInvoice.satoshis) return decodedInvoice.satoshis
  }
  return 0
}

export function getEventRoot(event: NDKEvent) {
  const rootEvent = event?.tags?.find((t) => t[0] === "e" && t[3] === "root")?.[1]
  if (rootEvent) {
    return rootEvent
  }
  // first e tag
  return event?.tags?.find((t) => t[0] === "e")?.[1]
}

export function getLikedEventId(event: NDKEvent) {
  if (!event.tags) {
    return undefined
  }
  return event.tags
    .slice()
    .reverse()
    .find((tag: NDKTag) => tag[0] === "e")?.[1]
}

export const getTag = (key: string, tags: NDKTag[]): string => {
  for (const t of tags) {
    if (t[0] === key) {
      return t[1]
    }
  }
  return ""
}

export const getTags = (key: string, tags: NDKTag[]): string[] => {
  const res: string[] = []
  for (const t of tags) {
    if (t[0] == key) {
      res.push(t[1])
    }
  }
  return res
}

export const npubToHex = (npub: string): string | void => {
  try {
    return nip19.decode(npub).data.toString()
  } catch (error) {
    console.error("Error decoding npub:", error)
  }
}

export const fetchZappedAmount = async (event: NDKEvent): Promise<number> => {
  return new Promise((resolve) => {
    let zappedAmount = 0
    const filter = {
      kinds: [9735],
      ["#e"]: [event.id],
    }
    try {
      const sub = ndk().subscribe(filter)

      sub?.on("event", (event) => {
        const invoice = event.tagValue("bolt11")
        if (invoice) {
          const decodedInvoice = bolt11.decode(invoice)
          if (decodedInvoice.complete && decodedInvoice.satoshis)
            zappedAmount = zappedAmount + decodedInvoice.satoshis
        }
      })
      sub?.on("eose", () => {
        sub?.stop()
        resolve(zappedAmount)
      })
    } catch (error) {
      console.warn(error)
    }
  })
}

// export const getIds = (idsMap: Map) => {
//   if (idsMap) {
//     const arrIds = Array.from(idsMap.entries())
//       .filter((entry) => entry[1] === "p")
//       .map((pTag) => pTag[0])
//     return arrIds
//   } else {
//     return []
//   }
// }

export const sortEventArrayDesc = (events: NDKEvent[]): NDKEvent[] => {
  return events.sort((a, b) => (b?.created_at || 0) - (a?.created_at || 0))
}

export const extractUrls = (relays: NDKRelayList): string[] => {
  const urls: string[] = []
  relays.tags.forEach((relay) => {
    urls.push(relay[1])
  })
  return urls
}

export type RawEvent = {
  id: string
  kind: number
  created_at: number
  content: string
  tags: string[][]
  sig: string
  pubkey: string
}

export const NDKEventFromRawEvent = (rawEvent: RawEvent): NDKEvent => {
  const ndkEvent = new NDKEvent()
  ndkEvent.ndk = ndk()
  ndkEvent.kind = rawEvent.kind
  ndkEvent.id = rawEvent.id
  ndkEvent.content = rawEvent.content
  ndkEvent.tags = rawEvent.tags
  ndkEvent.created_at = rawEvent.created_at
  ndkEvent.sig = rawEvent.sig
  ndkEvent.pubkey = rawEvent.pubkey
  return ndkEvent
}
export const serializeEvent = (event: NDKEvent): string => {
  return JSON.stringify({
    id: event?.id,
    pubkey: event?.pubkey,
    created_at: event?.created_at,
    kind: event?.kind,
    tags: event?.tags,
    content: event?.content,
    sig: event?.sig,
  })
}
export const deserializeEvent = (event: string): NDKEvent => {
  const parsedEvent = JSON.parse(event)
  const ndkEvent = new NDKEvent()
  ndkEvent.ndk = ndk()
  ndkEvent.id = parsedEvent.id
  ndkEvent.kind = parsedEvent.kind
  ndkEvent.pubkey = parsedEvent.pubkey
  ndkEvent.created_at = parsedEvent.created_at
  ndkEvent.content = parsedEvent.content
  ndkEvent.tags = parsedEvent.tags
  ndkEvent.sig = parsedEvent.sig
  return ndkEvent
}
export const getProfileName = (profile: NDKUserProfile): string => {
  let name = ""

  if (profile.name) {
    name = profile.name
  } else if (!profile.name && profile.displayName) {
    name = profile.displayName
  } else if (
    !profile.name &&
    !profile.displayName &&
    profile.display_name &&
    typeof profile.display_name === "string" // can be number for some reason
  ) {
    name = profile.display_name
  }
  return name
}
export const isQuote = (event: NDKEvent): boolean => {
  if (event.kind === 9373 && event.tagValue("q")) return true
  if (event.kind === 1 && event.tagValue("q")) return true
  if (
    event.tags
      .filter((tag) => tag[0] === "e")
      .filter((tag) => tag[3] === "mention" && tag[1] === event.id).length
  )
    return true
  if (event.content.match(eventRegex)) return true
  return false
}
export const isRezap = (event: NDKEvent): boolean => {
  return event?.tags
    .filter((tag) => tag[0] === "e")
    .toString()
    .includes("rezap")
}
export const isIssue = (event: NDKEvent): boolean => {
  if (event.kind === 30078) {
    const dTag = event.tagValue("d")
    if (dTag) {
      return ISSUE_REGEX.test(dTag)
    }
  }
  return false
}
export const isIssueNotification = (notification: Notification): boolean => {
  if (notification.kind === 6927) {
    const type = notification.tags ? getTag("type", notification.tags) : null
    if (type === "issue") {
      return true
    }
  }
  return false
}
export const isPRNotification = (notification: Notification): boolean => {
  if (notification.kind === 6927) {
    const type = notification.tags ? getTag("type", notification.tags) : null
    if (type === "pull-request") {
      return true
    }
  }
  return false
}
export const isGitCommentNotification = (notification: Notification): boolean => {
  if (notification.kind === 6927) {
    const type = notification.tags ? getTag("type", notification.tags) : null
    if (type === "pr-comment" || type === "issue-comment") {
      return true
    }
  }
  return false
}
export const isAssignNotification = (notification: Notification): boolean => {
  if (notification.kind === 6927) {
    const type = notification.tags ? getTag("type", notification.tags) : null
    if (type === "pr-assign" || type === "issue-assign") {
      return true
    }
  }
  return false
}
export const isReviewRequestNotification = (notification: Notification): boolean => {
  if (notification.kind === 6927) {
    const type = notification.tags ? getTag("type", notification.tags) : null
    if (type === "pr-review-request") {
      return true
    }
  }
  return false
}
export const isPR = (event: NDKEvent): boolean => {
  if (event.kind === 30078) {
    const dTag = event.tagValue("d")
    if (dTag) {
      return PR_REGEX.test(dTag)
    }
  }
  return false
}
export const isGem = (event: NDKEvent): boolean => {
  if (event.kind === 30078) {
    const dTag = event.tagValue("d")
    if (dTag) {
      return dTag.includes("user/gems/")
    }
  }
  return false
}
export function useRepoCollaborators(repo: string): [string[], Dispatch<string[]>] {
  const repoOwner = useMemo(() => {
    // todo: fetch repo owner's pubKey
    return "78a317586cbc30d20f8aa94d8450eb0cd58b312bad94fc76139c72eb2e5c81d2"
  }, [repo])

  const [contributors, setContributors] = useState<string[]>([])

  // todo: remove TONE_E's pubKey
  useEffect(() => {
    const permissionFilter = {
      kinds: [16629],
      authors: [
        repoOwner,
        "91dfb08db37712e74d892adbbf63abab43cb6aa3806950548f3146347d29b6ae",
      ],
      ["#r"]: [repo],
    }

    const sub = ndk().subscribe(permissionFilter)

    let latestTimestamp = 0
    sub.on("event", (event: NDKEvent) => {
      if (event && event.created_at && event.created_at > latestTimestamp) {
        latestTimestamp = event.created_at
        const contributorsTag = event.tagValue("contributors")
        if (contributorsTag) {
          const pubKeys: string[] = JSON.parse(contributorsTag)
          setContributors(pubKeys)
        }
      }
    })
    return () => {
      sub.stop()
    }
  }, [repoOwner])

  return [contributors, setContributors]
}
// returns the pubKeys of all authors who have published kind 30078 with the d tag param
export function useAuthorsWhoHavePublished(fTag: string): string[] {
  const [authors, setAuthors] = useState<string[]>([])

  useEffect(() => {
    const authorFilter = {
      kinds: [30078],
      ["#f"]: [fTag],
    }

    const authors: string[] = []

    const sub = ndk().subscribe(authorFilter)

    sub.on("event", (event: NDKEvent) => {
      if (event) {
        if (!authors.some((author) => author === event.pubkey)) {
          authors.push(event.pubkey)
          setAuthors([...authors])
        }
      }
    })
  }, [])

  return authors
}
