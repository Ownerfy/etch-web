import NDK, {Hexpubkey, NDKEvent, NDKFilter} from "@nostr-dev-kit/ndk"

import {getTags} from "@/utils/nostr.ts"

export const muteUser = async (
  ndk: NDK,
  mutedList: string[],
  pubkey: string
): Promise<string[]> => {
  // Check if pubkey already exists in the list before adding
  const newList = mutedList.includes(pubkey) ? mutedList : [...mutedList, pubkey]
  const newTags = newList.map((entry: string) => ["p", entry])

  const muteEvent = new NDKEvent(ndk)
  muteEvent.kind = 10000
  muteEvent.tags = newTags

  try {
    await muteEvent.publish()
    return newList
  } catch (error) {
    console.warn("Unable to mute user", error)
    return mutedList
  }
}

export const unmuteUser = async (
  ndk: NDK,
  mutedList: string[],
  pubkey: string
): Promise<string[]> => {
  const newList = mutedList.filter((entry: string) => entry !== pubkey)
  const newTags = newList.map((entry: string) => ["p", entry])

  const unmuteEvent = new NDKEvent(ndk)
  unmuteEvent.kind = 10000
  unmuteEvent.tags = newTags

  try {
    await unmuteEvent.publish()
    return newList
  } catch (error) {
    console.warn("Unable to unmute user", error)
    return mutedList
  }
}

export const submitReport = async (
  ndk: NDK,
  reason: string,
  content: string,
  pubkey: Hexpubkey, //pubkey needed
  id?: string //event optional
) => {
  const reportEvent = new NDKEvent(ndk)
  reportEvent.kind = 1984
  reportEvent.content = content

  reportEvent.tags = id
    ? [
        ["e", id, reason],
        ["p", pubkey],
      ]
    : [["p", pubkey, reason]]
  try {
    await reportEvent.publish()
  } catch (error) {
    console.warn("Unable to send report", error)
    return Promise.reject(error)
  }
}

export const publishReply = async (
  ndk: NDK,
  content: string,
  event: NDKEvent,
  dhtPubKey: string
) => {
  const parentNotes = getTags("p", event.tags)
  const isRootReply = parentNotes.length === 0 ? true : false

  const replyEvent = new NDKEvent(ndk)
  replyEvent.kind = 1
  replyEvent.content = content
  replyEvent.tags = [
    ["e", event.id, "", isRootReply ? "root" : "reply"],
    ["p", event.pubkey],
    ["dht_key", dhtPubKey],
  ]

  for (const t of parentNotes) {
    replyEvent.tags.push(["p", t])
  }

  try {
    await replyEvent.publish()
  } catch (error) {
    console.warn("Unable to send reply", error)
    return Promise.reject(error)
  }
}

export const fetchReplies = async (ndk: NDK, event: NDKEvent): Promise<Set<NDKEvent>> => {
  const replyFilter: NDKFilter = {
    kinds: [1],
    ["#e"]: [event.id],
  }

  return await ndk
    .fetchEvents(replyFilter, {closeOnEose: true})
    .then((replies) => {
      return replies
    })
    .catch((error) => {
      console.warn("Error fetching replies", error)
      return new Set()
    })
}
