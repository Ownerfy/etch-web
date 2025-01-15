import {useState, useRef, useEffect, ChangeEvent, FormEvent} from "react"
import {InviteLink, serializeChannelState} from "nostr-double-ratchet"
import {acceptInviteLink} from "@/shared/hooks/useInviteLinkFromUrl"
import QRCodeButton from "@/shared/components/user/QRCodeButton"
import {NDKEventFromRawEvent} from "@/utils/nostr"
import {hexToBytes} from "@noble/hashes/utils"
import {useNavigate} from "react-router-dom"
import {getInviteLinks} from "./InviteLinks"
import {useLocalState} from "irisdb-hooks"
import {nip19} from "nostr-tools"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"

const NewChat = () => {
  const navigate = useNavigate()
  const [myPubKey] = useLocalState("user/publicKey", "")
  const [myPrivKey] = useLocalState("user/privateKey", "")
  const [inviteLinks, setInviteLinks] = useState<Map<string, InviteLink>>(new Map())
  const [inviteLinkInput, setInviteLinkInput] = useState("")
  const labelInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return getInviteLinks((id, inviteLink) => {
      setInviteLinks(new Map(inviteLinks.set(id, inviteLink)))
    })
  }, [])

  const createInviteLink = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (labelInputRef.current) {
      const label = labelInputRef.current.value.trim() || "New Invite Link"
      const newLink = InviteLink.createNew(myPubKey, label)
      const id = crypto.randomUUID()
      localState.get(`inviteLinks/${id}`).put(newLink.serialize())
      setInviteLinks(new Map(inviteLinks.set(id, newLink)))
      labelInputRef.current.value = "" // Clear the input after creating
    }
  }

  const deleteInviteLink = (id: string) => {
    localState.get(`inviteLinks/${id}`).put(null)
    inviteLinks.delete(id)
    setInviteLinks(new Map(inviteLinks))
  }

  const handleInviteLinkInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setInviteLinkInput(input)

    try {
      const inviteLink = InviteLink.fromUrl(input)
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

      // Navigate to the new chat
      navigate(`/messages/${inviteLink.inviter}`)
    } catch (error) {
      console.error("Invalid invite link:", error)
      // Optionally, you can show an error message to the user here
    }
  }

  const onScanSuccess = (data: string) => {
    acceptInviteLink(data, myPubKey, myPrivKey, navigate)
  }

  return (
    <>
      <div className="m-4 p-4 md:p-8 rounded-lg bg-base-100 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Have someone&apos;s invite link?</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="input input-bordered w-96 max-w-full"
              placeholder="Paste invite link"
              value={inviteLinkInput}
              onChange={handleInviteLinkInput}
            />
            <QRCodeButton
              data=""
              showQRCode={false}
              onScanSuccess={(data) =>
                handleInviteLinkInput({target: {value: data}} as any)
              }
              icon="qr"
            />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Share your invite link</h2>
          <form onSubmit={createInviteLink} className="flex items-center gap-2 mb-4">
            <input
              ref={labelInputRef}
              type="text"
              placeholder="Label (optional)"
              className="input input-bordered w-64"
            />
            <button type="submit" className="btn btn-primary whitespace-nowrap">
              Create Invite Link
            </button>
          </form>
          <div className="space-y-3">
            {Array.from(inviteLinks).map(([id, link]) => (
              <div key={id} className="flex items-center justify-between">
                <span>{link.label}</span>
                <div className="space-x-2 flex items-center">
                  <QRCodeButton
                    npub={myPubKey && nip19.npubEncode(myPubKey)}
                    data={link.getUrl()}
                    onScanSuccess={onScanSuccess}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(link.getUrl())}
                    className="btn btn-sm btn-outline"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => deleteInviteLink(id)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default NewChat
