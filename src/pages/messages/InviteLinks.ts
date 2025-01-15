import {
  Channel,
  InviteLink,
  KeyType,
  NostrFilter,
  Sender,
  serializeChannelState,
} from "nostr-double-ratchet"
import {showNotification, subscribeToAuthorDMNotifications} from "@/utils/notifications"
import {hexToBytes} from "@noble/hashes/utils"
import {JsonValue, localState, Unsubscribe} from "irisdb"
import {VerifiedEvent} from "nostr-tools"
import {ndk} from "irisdb-nostr"

const inviteLinks = new Map<string, InviteLink>()
const subscriptions = new Map<string, Unsubscribe>()

let user: {publicKey?: string; privateKey?: string} | null = null

export function getInviteLinks(
  callback: (id: string, inviteLink: InviteLink) => void
): Unsubscribe {
  inviteLinks.clear() // Clear the existing map before repopulating

  return localState.get("inviteLinks").forEach((link, path) => {
    const id = path.split("/").pop()!
    if (link && typeof link === "string") {
      try {
        const inviteLink = InviteLink.deserialize(link)
        callback(id, inviteLink)
      } catch (e) {
        console.error(e)
      }
    }
  })
}

const nostrSubscribe = (filter: NostrFilter, onEvent: (e: VerifiedEvent) => void) => {
  const sub = ndk().subscribe(filter)
  sub.on("event", (event) => {
    onEvent(event)
  })
  return () => sub.stop()
}

function listen() {
  let channels: JsonValue
  localState.get("channels").on((c) => (channels = c))
  if (user?.publicKey && user?.privateKey) {
    for (const id of inviteLinks.keys()) {
      if (!subscriptions.has(id)) {
        const inviteLink = inviteLinks.get(id)!
        const decrypt = user.privateKey
          ? hexToBytes(user.privateKey)
          : async (cipherText: string, pubkey: string) => {
              // @ts-expect-error: nip44 exists at runtime but is not in the type definition
              if (window.nostr?.nip44) {
                // @ts-expect-error: nip44 exists at runtime but is not in the type definition
                const result = window.nostr.nip44.decrypt(cipherText, pubkey)
                if (!result || typeof result !== "string") {
                  throw new Error("Failed to decrypt")
                }
                return result as string
              }
              throw new Error("No nostr extension or private key")
            }
        const unsubscribe = inviteLink.listen(
          decrypt,
          nostrSubscribe,
          (channel: Channel, identity?: string) => {
            const id = identity || "asdf"
            const current = channel.getNostrSenderKeypair(Sender.Them, KeyType.Current)
            const next = channel.getNostrSenderKeypair(Sender.Them, KeyType.Next)
            subscribeToAuthorDMNotifications([current.publicKey, next.publicKey])
            localState.get("channels").on((c) => console.log("channels", c))
            setTimeout(() => {
              if (!channels || !Object.keys(channels).includes(id)) {
                console.log("new channel", identity)
                localState
                  .get("channels")
                  .get(id)
                  .put(serializeChannelState(channel.state))
                showNotification("New chat via invite link", {
                  data: {
                    url: `/messages/${identity}`,
                  },
                })
              }
            }, 1000)
          }
        )
        subscriptions.set(id, unsubscribe)
      }
    }
  }
}

getInviteLinks((id, inviteLink) => {
  if (!inviteLinks.has(id)) {
    inviteLinks.set(id, inviteLink)
    listen()
  }
})

localState.get("user").on((u) => {
  user = u as {publicKey?: string; privateKey?: string}
  listen()
})
