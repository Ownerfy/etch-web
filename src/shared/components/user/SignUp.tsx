import {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react"
// import {generateSecretKey, getPublicKey, nip19} from "nostr-tools"
import {NDKEvent, NDKPrivateKeySigner} from "@nostr-dev-kit/ndk"
import {createUser} from "@/shared/services/BackendServices"
import {generateSecretKey, getPublicKey} from "nostr-tools"
import {bytesToHex} from "@noble/hashes/utils"
// import {useLocalState} from "irisdb-hooks"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"

const NSEC_NPUB_REGEX = /(nsec1|npub1)[a-zA-Z0-9]{20,65}/gi

interface SignUpProps {
  onClose: () => void
}

export default function SignUp({onClose}: SignUpProps) {
  const [username, setusername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  //const [, setShowLoginDialog] = useLocalState("home/showLoginDialog", false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef.current])

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    setusername(e.target.value)
  }

  function onEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
  }

  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value)
  }

  function onConfirmPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(e.target.value)
  }

  async function onNewUserLogin(e: FormEvent) {
    e.preventDefault()
    let valid = true

    if (username.match(NSEC_NPUB_REGEX)) {
      setNameError("Invalid username format.")
      valid = false
    } else {
      setNameError("")
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid email format.")
      valid = false
    } else {
      setEmailError("")
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      valid = false
    } else {
      setPasswordError("")
    }

    if (valid && username && email && password) {
      ndk()
      // const sk = generateSecretKey() // `sk` is a Uint8Array
      // const pk = getPublicKey(sk) // `pk` is a hex string
      const {sk, pk} = await createUser({username, email, password})
      console.log("sk and pk", sk, pk)
      // const npub = nip19.npubEncode(pk) // for cashu as well. TODO: Remove Cashu when we know its not needed
      const privateKeyHex = bytesToHex(sk)
      localState.get("user/privateKey").put(privateKeyHex)
      localState.get("user/publicKey").put(pk)
      // localStorage.setItem("cashu.ndk.privateKeySignerPrivateKey", privateKeyHex)
      // localStorage.setItem("cashu.ndk.pubkey", pk)
      const privateKeySigner = new NDKPrivateKeySigner(privateKeyHex)
      ndk().signer = privateKeySigner
      const profileEvent = new NDKEvent(ndk())
      profileEvent.kind = 0
      profileEvent.content = JSON.stringify({
        display_name: username,
        //lud16: CONFIG.features.cashu ? `${npub}@npub.cash` : undefined,
      })
      console.log("sk and private key", sk, privateKeyHex)
      // profileEvent.publish()
      // setShowLoginDialog(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 ">
      <form
        className="flex flex-col items-center gap-4 flex-wrap"
        onSubmit={(e) => onNewUserLogin(e)}
      >
        <h1 className="text-2xl font-bold">Sign up</h1>
        <input
          ref={inputRef}
          autoComplete="Username"
          autoFocus
          className="input input-bordered w-[300px]"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => onNameChange(e)}
        />
        {nameError && <p className="text-red-500">{nameError}</p>}
        <input
          autoComplete="email"
          className="input input-bordered w-[300px]"
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e)}
        />
        {emailError && <p className="text-red-500">{emailError}</p>}
        <input
          className="input input-bordered w-[300px]"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e)}
        />
        <input
          className="input input-bordered w-[300px]"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e)}
        />
        {passwordError && <p className="text-red-500">{passwordError}</p>}
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
