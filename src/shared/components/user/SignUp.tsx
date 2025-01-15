import {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react"
import {generateSecretKey, getPublicKey, nip19} from "nostr-tools"
import {NDKEvent, NDKPrivateKeySigner} from "@nostr-dev-kit/ndk"
import {bytesToHex} from "@noble/hashes/utils"
import {useLocalState} from "irisdb-hooks"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"

const NSEC_NPUB_REGEX = /(nsec1|npub1)[a-zA-Z0-9]{20,65}/gi

interface SignUpProps {
  onClose: () => void
}

export default function SignUp({onClose}: SignUpProps) {
  const [newUserName, setNewUserName] = useState("")
  const [, setShowLoginDialog] = useLocalState("home/showLoginDialog", false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef.current])

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (val.match(NSEC_NPUB_REGEX)) {
      e.preventDefault()
    } else {
      setNewUserName(e.target.value)
    }
  }

  function onNewUserLogin(e: FormEvent) {
    e.preventDefault()
    if (newUserName) {
      ndk()
      const sk = generateSecretKey() // `sk` is a Uint8Array
      const pk = getPublicKey(sk) // `pk` is a hex string
      const npub = nip19.npubEncode(pk)
      const privateKeyHex = bytesToHex(sk)
      localState.get("user/privateKey").put(privateKeyHex)
      localState.get("user/publicKey").put(pk)
      localStorage.setItem("cashu.ndk.privateKeySignerPrivateKey", privateKeyHex)
      localStorage.setItem("cashu.ndk.pubkey", pk)
      const privateKeySigner = new NDKPrivateKeySigner(privateKeyHex)
      ndk().signer = privateKeySigner
      const profileEvent = new NDKEvent(ndk())
      profileEvent.kind = 0
      profileEvent.content = JSON.stringify({
        display_name: newUserName,
        lud16: CONFIG.features.cashu ? `${npub}@npub.cash` : undefined,
      })
      profileEvent.publish()
      setShowLoginDialog(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col items-center gap-4 flex-wrap"
        onSubmit={(e) => onNewUserLogin(e)}
      >
        <h1 className="text-2xl font-bold">Sign up</h1>
        <input
          ref={inputRef}
          autoComplete="name"
          autoFocus
          className="input input-bordered"
          type="text"
          placeholder="What's your name?"
          value={newUserName}
          onChange={(e) => onNameChange(e)}
        />
        <button className="btn btn-primary" type="submit">
          Go
        </button>
      </form>
      <div
        className="flex flex-col items-center justify-center gap-4 flex-wrap border-t pt-4 cursor-pointer"
        onClick={onClose}
      >
        <span className="hover:underline">Already have an account?</span>
        <button className="btn btn-sm btn-neutral">Sign in</button>
      </div>
    </div>
  )
}
