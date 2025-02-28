import {SocialGraph, NostrEvent, SerializedSocialGraph} from "nostr-social-graph"
import {NDKEvent, NDKSubscription, NDKUserProfile} from "@nostr-dev-kit/ndk"
import profileJson from "nostr-social-graph/data/profileData.json"
import {profileCache} from "./memcache"
import localForage from "localforage"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"
import {throttle} from "lodash"
import Fuse from "fuse.js"

const DEFAULT_SOCIAL_GRAPH_ROOT =
  "4523be58d395b1b196a9b8c82b038b6895cb02b683d0c253a955068dba1facd0"

let instance = new SocialGraph(DEFAULT_SOCIAL_GRAPH_ROOT)
let isInitialized = false

async function initializeInstance(publicKey?: string) {
  if (isInitialized) {
    console.log("setting root", publicKey)
    instance.setRoot(publicKey ?? DEFAULT_SOCIAL_GRAPH_ROOT)
    return
  }
  isInitialized = true
  const data = await localForage.getItem("socialGraph")
  if (data && typeof data === "object") {
    try {
      instance = new SocialGraph(
        publicKey ?? DEFAULT_SOCIAL_GRAPH_ROOT,
        data as SerializedSocialGraph
      )
      console.log("Loaded social graph of size", instance.size())
    } catch (e) {
      console.error("error deserializing", e)
      await localForage.removeItem("socialGraph")
      const {default: preCrawledGraph} = await import(
        "nostr-social-graph/data/socialGraph.json"
      )
      instance = new SocialGraph(
        publicKey ?? DEFAULT_SOCIAL_GRAPH_ROOT,
        preCrawledGraph as unknown as SerializedSocialGraph
      )
    }
  } else {
    await localForage.removeItem("socialGraph")
    const {default: preCrawledGraph} = await import(
      "nostr-social-graph/data/socialGraph.json"
    )
    instance = new SocialGraph(
      publicKey ?? DEFAULT_SOCIAL_GRAPH_ROOT,
      preCrawledGraph as unknown as SerializedSocialGraph
    )
  }
}

const MAX_SOCIAL_GRAPH_SERIALIZE_SIZE = 1000000
const throttledSave = throttle(async () => {
  try {
    await localForage.setItem(
      "socialGraph",
      instance.serialize(MAX_SOCIAL_GRAPH_SERIALIZE_SIZE)
    )
    console.log("Saved social graph of size", instance.size())
  } catch (e) {
    console.error("failed to serialize SocialGraph or UniqueIds", e)
    console.log("social graph size", instance.size())
  }
}, 10000)

export const handleFollowEvent = (evs: NostrEvent | Array<NostrEvent>) => {
  instance.handleEvent(evs)
  throttledSave()
}

let sub: NDKSubscription | undefined

export type SearchResult = {
  name: string
  pubKey: string
  nip05?: string
}

const latestProfileEvents = new Map<string, number>()

console.time("fuse init")
// const fuseIndex = Fuse.parseIndex(fuseIndexData)

const processedData = [] as SearchResult[]
profileJson.forEach((v) => {
  if (v[0] && v[1]) {
    processedData.push({
      pubKey: v[0],
      name: v[1],
      nip05: v[2] || undefined,
    })

    let pictureUrl = v[3]
    if (pictureUrl && !pictureUrl.startsWith("http://")) {
      pictureUrl = `https://${pictureUrl}`
    }
    profileCache.set(v[0], {username: v[1], picture: pictureUrl || undefined})
  }
})

export const searchIndex = new Fuse<SearchResult>(processedData, {
  keys: ["name", "nip05"],
  includeScore: true,
})
console.timeEnd("fuse init")

export function handleProfile(pubKey: string, profile: NDKUserProfile) {
  queueMicrotask(() => {
    const lastSeen = latestProfileEvents.get(pubKey) || 0
    if (profile.created_at && profile.created_at > lastSeen) {
      latestProfileEvents.set(pubKey, profile.created_at)
      const name = String(profile.name || profile.username)
      const nip05 = profile.nip05
      if (name) {
        // not sure if this remove is efficient?
        // should we have our internal map and reconstruct the searchIndex from it with debounce?
        searchIndex.remove((profile) => profile.pubKey === pubKey)
        searchIndex.add({name, pubKey, nip05})
      }
    }
  })
}

export function getFollowLists(myPubKey: string, missingOnly = true, upToDistance = 1) {
  const toFetch = new Set<string>()

  // Function to add users to toFetch set
  const addUsersToFetch = (users: Set<string>, currentDistance: number) => {
    for (const user of users) {
      if (!missingOnly || instance.getFollowedByUser(user).size === 0) {
        toFetch.add(user)
      }
    }

    // If we haven't reached the upToDistance, continue to the next level
    if (currentDistance < upToDistance) {
      for (const user of users) {
        const nextLevelUsers = instance.getFollowedByUser(user)
        addUsersToFetch(nextLevelUsers, currentDistance + 1)
      }
    }
  }

  // Start with the user's direct follows
  const myFollows = instance.getFollowedByUser(myPubKey)
  addUsersToFetch(myFollows, 1)

  console.log("fetching", toFetch.size, missingOnly ? "missing" : "total", "follow lists")

  const fetchBatch = (authors: string[]) => {
    const sub = ndk().subscribe(
      {
        kinds: [3],
        authors: authors,
      },
      {closeOnEose: true}
    )
    sub.on("event", (e) => handleFollowEvent(e))
  }

  const processBatch = () => {
    const batch = [...toFetch].slice(0, 500)
    if (batch.length > 0) {
      fetchBatch(batch)
      batch.forEach((author) => toFetch.delete(author))
      if (toFetch.size > 0) {
        setTimeout(processBatch, 5000)
      }
    }
  }

  processBatch()
}

function getMissingFollowLists(myPubKey: string) {
  getFollowLists(myPubKey, true)
}

// Get the WoT distance for a given user. Lower WoT distance means more trusted.
export function getWoTScore(pubKey: string): number {
  const followDistance = instance.getFollowDistance(pubKey) // lower is better

  // Get the number of friends who follow the user
  const followedByFriendsCount = instance.followedByFriendsCount(pubKey) // higher is better

  if (followedByFriendsCount === 0) return followDistance

  // Calculate the WoT distance
  const woTDistance = (followDistance * followDistance) / followedByFriendsCount

  return woTDistance
}

const throttledRecalculate = throttle(
  () => {
    instance.recalculateFollowDistances()
  },
  10000,
  {leading: true}
)

export const socialGraphLoaded = new Promise((resolve) => {
  localState.get("user/publicKey").on(async (publicKey?: string) => {
    await initializeInstance(publicKey)
    resolve(true)
    if (publicKey) {
      sub?.stop()
      sub = ndk().subscribe({
        kinds: [3],
        authors: [publicKey],
        limit: 1,
      })
      let latestTime = 0
      sub?.on("event", (ev) => {
        if (typeof ev.created_at !== "number" || ev.created_at < latestTime) {
          return
        }
        latestTime = ev.created_at
        handleFollowEvent(ev as NostrEvent)
        queueMicrotask(() => getMissingFollowLists(publicKey))
        throttledRecalculate()
      })
    } else {
      instance.setRoot(DEFAULT_SOCIAL_GRAPH_ROOT)
    }
  }, true)
})

let hideEventsByUnknownUsers = false
localState.get("settings/hideEventsByUnknownUsers").on((v) => {
  hideEventsByUnknownUsers = v as boolean
})

export function shouldHideEvent(ev: NDKEvent) {
  if (!hideEventsByUnknownUsers) return false
  const distance = instance.getFollowDistance(ev.pubkey)
  return typeof distance !== "number" || distance > 10
}

export const saveToFile = () => {
  const data = instance.serialize()
  const url = URL.createObjectURL(
    new File([JSON.stringify(data)], "social_graph.json", {
      type: "text/json",
    })
  )
  const a = document.createElement("a")
  a.href = url
  a.download = "social_graph.json"
  a.click()
}

export const loadFromFile = (merge = false) => {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ".json"
  input.multiple = false
  input.onchange = () => {
    if (input.files?.length) {
      const file = input.files[0]
      file.text().then((json) => {
        try {
          const data = JSON.parse(json)
          if (merge) {
            instance.merge(new SocialGraph(instance.getRoot(), data))
          } else {
            instance = new SocialGraph(instance.getRoot(), data)
          }
        } catch (e) {
          console.error("failed to load social graph from file:", e)
        }
      })
    }
  }
  input.click()
}

export const downloadLargeGraph = () => {
  fetch("https://files.iris.to/large_social_graph.json")
    .then((response) => response.json())
    .then((data) => {
      instance = new SocialGraph(instance.getRoot(), data)
      throttledSave()
    })
    .catch((error) => {
      console.error("failed to load large social graph:", error)
    })
}

export const loadAndMerge = () => loadFromFile(true)

export default () => instance
