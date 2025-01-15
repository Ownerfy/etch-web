import socialGraph, {handleFollowEvent} from "@/utils/socialGraph.ts"
import {useEffect, useState, useMemo} from "react"
import {NostrEvent} from "nostr-social-graph"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {ndk, PublicKey} from "irisdb-nostr"

const useFollows = (pubKey: string, includeSelf = false) => {
  const pubKeyHex = useMemo(
    () => (pubKey ? new PublicKey(pubKey).toString() : ""),
    [pubKey]
  )
  const [follows, setFollows] = useState<string[]>([
    ...socialGraph().getFollowedByUser(pubKeyHex, includeSelf),
  ])

  useEffect(() => {
    try {
      if (pubKey) {
        const filter = {kinds: [3], authors: [pubKeyHex]}

        const sub = ndk().subscribe(filter)

        let latestTimestamp = 0

        sub?.on("event", (event: NDKEvent) => {
          event.ndk = ndk()
          socialGraph().handleEvent(event as NostrEvent)
          if (event && event.created_at && event.created_at > latestTimestamp) {
            latestTimestamp = event.created_at
            handleFollowEvent(event as NostrEvent)
            const pubkeys = event
              .getMatchingTags("p")
              .map((pTag) => pTag[1])
              .sort((a, b) => {
                return (
                  socialGraph().getFollowDistance(a) - socialGraph().getFollowDistance(b)
                )
              })
            if (includeSelf) {
              pubkeys.unshift(pubKey)
            }
            setFollows(pubkeys)
          }
        })
        return () => {
          sub.stop()
        }
      }
    } catch (error) {
      console.warn(error)
    }
  }, [pubKey, includeSelf])

  return follows
}

export default useFollows
