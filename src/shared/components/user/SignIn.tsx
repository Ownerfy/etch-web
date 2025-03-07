import {signIn} from "@/shared/services/BackendServices"
import {NDKPrivateKeySigner} from "@nostr-dev-kit/ndk"
import {useLocalState} from "irisdb-hooks"
import React, {useState} from "react"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"

interface SignInProps {
  onClose: () => void
}

export default function SignIn({onClose}: SignInProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [, setBskyHandle] = useLocalState("bsky/handle", "")
  const [, setBskyDid] = useLocalState("bsky/did", "")
  const [, setBskyAvatar] = useLocalState("bsky/avatar", "")
  const [, setShowLoginDialog] = useLocalState("home/showLoginDialog", false)
  const [, setShowForgotPasswordDialog] = useLocalState(
    "home/showForgotPasswordDialog",
    false
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      const {privKey, nostrPubKey, bskyData} = await signIn({email, password})
      const handle = bskyData.handle || ""
      const did = bskyData.did || ""
      const avatar = bskyData.avatar || ""
      setBskyHandle(handle)
      setBskyDid(did)
      setBskyAvatar(avatar)
      localState.get("user/privateKey").put(privKey)
      localState.get("user/publicKey").put(nostrPubKey)
      const privateKeySigner = new NDKPrivateKeySigner(privKey)
      ndk().signer = privateKeySigner
      setShowLoginDialog(false)
      onClose()
    } catch {
      setError("Invalid email or password")
    }
  }

  const handleForgotPassword = () => {
    setShowLoginDialog(false)
    setShowForgotPasswordDialog(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col items-center gap-4 flex-wrap"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold">Sign in</h1>
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered max-w-xs w-[300px]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input input-bordered max-w-xs w-[300px]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-error text-sm">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Sign In
        </button>
        <button
          type="button"
          className="btn btn-link text-blue-500"
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </button>
      </form>
      <div
        className="flex flex-col items-center justify-center gap-4 flex-wrap border-t pt-4 cursor-pointer"
        onClick={onClose}
      >
        <span className="hover:underline">Don&apos;t have an account?</span>
        <button className="btn btn-sm btn-neutral">Sign up</button>
      </div>
    </div>
  )
}
