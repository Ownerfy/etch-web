import {NDKEvent} from "@nostr-dev-kit/ndk"
import {getTags} from "@/utils/nostr.ts"
import {ndk} from "irisdb-nostr"

export const fetchAuthorsMuteList = (
  event: NDKEvent | undefined,
  setAuthorsMuteList: (list: string[]) => void
) => {
  const muteFilter = {kinds: [10000], authors: [event?.pubkey || ""]}
  const sub = ndk().subscribe(muteFilter)

  let latestTimestamp = 0
  sub.on("event", (muteListEvent) => {
    if (muteListEvent && muteListEvent.created_at) {
      if (muteListEvent.created_at > latestTimestamp) {
        latestTimestamp = muteListEvent.created_at
        const mutedPubKeys = getTags("p", muteListEvent.tags)
        const mutedEvents = getTags("e", muteListEvent.tags)
        setAuthorsMuteList([...mutedPubKeys, ...mutedEvents])
      }
    }
  })
  return () => {
    sub.stop()
  }
}
