import {InviteLink, serializeChannelState} from "nostr-double-ratchet"
import {useNavigate, useLocation} from "react-router-dom"
import {NDKEventFromRawEvent} from "@/utils/nostr"
import {hexToBytes} from "@noble/hashes/utils"
import {useLocalState} from "irisdb-hooks"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"
import {useEffect} from "react"

export const acceptInviteLink = async (
  url: string,
  myPubKey: string,
  myPrivKey?: string,
  navigate?: (path: string) => void
) => {
  try {
    const inviteLink = InviteLink.fromUrl(url)

    const encrypt = myPrivKey
      ? hexToBytes(myPrivKey)
      : async (plaintext: string, pubkey: string) => {
          // @ts-expect-error: nip44 exists at runtime but is not in the type definition
          if (window.nostr?.nip44) {
            // @ts-expect-error: nip44 exists at runtime but is not in the type definition
            return window.nostr.nip44.encrypt(plaintext, pubkey)
          }
          throw new Error("No nostr extension or private key")
        }

    const {channel, event} = await inviteLink.acceptInvite(
      (filter, onEvent) => {
        const sub = ndk().subscribe(filter)
        sub.on("event", onEvent)
        return () => sub.stop()
      },
      myPubKey,
      encrypt
    )

    // Publish the event
    NDKEventFromRawEvent(event).publish()

    // Save the channel
    localState
      .get(`channels/${inviteLink.inviter}`)
      .put(serializeChannelState(channel.state))

    // Navigate to the new chat if navigate function is provided
    if (navigate) {
      navigate(`/messages/${inviteLink.inviter}`)
    }

    return {success: true, inviter: inviteLink.inviter}
  } catch (error) {
    //console.error("Not a valid invite link URL:", error)
    return {success: false, error}
  }
}

export const useInviteLinkFromUrl = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [myPubKey] = useLocalState("user/publicKey", "")
  const [myPrivKey] = useLocalState("user/privateKey", "")

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    // if hash not present, do nothing
    if (!location.hash) {
      return
    }

    if (!myPubKey) {
      timeoutId = setTimeout(() => {
        localState.get("home/showLoginDialog").put(true)
      }, 500)
    } else {
      const acceptInviteFromUrl = async () => {
        const fullUrl = `${window.location.origin}${location.pathname}${location.search}${location.hash}`
        const result = await acceptInviteLink(fullUrl, myPubKey, myPrivKey, navigate)
        if (!result.success) {
          // Optionally, you can show an error message to the user here
        }
      }

      acceptInviteFromUrl()
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [location, myPubKey, myPrivKey, navigate])
}
