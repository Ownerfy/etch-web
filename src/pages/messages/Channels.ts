import {Channel, deserializeChannelState, NostrFilter} from "nostr-double-ratchet"
import {localState, Unsubscribe} from "irisdb"
import {VerifiedEvent} from "nostr-tools"
import {ndk} from "irisdb-nostr"

const channels = new Map<string, Channel>()

const subscribe = (filter: NostrFilter, onEvent: (event: VerifiedEvent) => void) => {
  const sub = ndk().subscribe(filter)
  sub.on("event", (event) => {
    console.log(event)
    onEvent(event)
  })
  return () => {} // no need to sub.stop(), old nostr senders might still have unseen?
}

export function getChannel(
  id: string,
  theirRatchetPublicKey: string,
  ourRatchetPrivateKey: Uint8Array
): Channel {
  if (!channels.has(id)) {
    let unsub: Unsubscribe | undefined = undefined
    unsub = localState
      .get("channels")
      .get(id)
      .get("state")
      .on(
        (state) => {
          if (typeof state === "string" && state !== null) {
            const deserialized = deserializeChannelState(state)
            console.log("deserialized", deserialized)
            channels.set(id, new Channel(subscribe, deserialized))
          } else {
            channels.set(
              id,
              Channel.init(subscribe, theirRatchetPublicKey, ourRatchetPrivateKey)
            )
          }
          unsub?.()
        },
        true,
        2
      )
  }
  return channels.get(id)!
}
