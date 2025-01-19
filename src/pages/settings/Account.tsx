import {signOut, auth} from "@/shared/services/firebase.tsx"
import {useNavigate} from "react-router-dom"
import {DEFAULT_RELAYS} from "irisdb-nostr"
import {useLocalState} from "irisdb-hooks"
import localforage from "localforage"
import {MouseEvent} from "react"

function Account() {
  const [, setPrivateKey] = useLocalState("user/privateKey", "", String)
  const [, setPublicKey] = useLocalState("user/publicKey", "", String)
  const [, setDHTPrivateKey] = useLocalState("user/DHTPrivateKey", "", String)
  const [, setDHTPublicKey] = useLocalState("user/DHTPublicKey", "", String)
  const [, setRelays] = useLocalState("user/relays", [])
  const [, setNip07Login] = useLocalState("user/nip07Login", false)
  const navigate = useNavigate()

  async function handleLogout(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    try {
      await signOut(auth)

      setPublicKey("")
      setPrivateKey("")
      setDHTPublicKey("")
      setDHTPrivateKey("")
      setRelays(DEFAULT_RELAYS)
      setNip07Login(false)
      localStorage.clear()
      await localforage.clear()

      // Unsubscribe from push notifications
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready
        const existingSub = await reg.pushManager.getSubscription()
        if (existingSub) {
          await existingSub.unsubscribe()
          console.log("Unsubscribed from push notifications")
        }
      }
      navigate("/")
      location.reload() // quick & dirty way to ensure everything is reset, especially localState
    } catch (err) {
      console.error("Error during logout:", err)
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Log out</h1>
      <div className="flex flex-col gap-4">
        <div className="mt-2">
          <button className="btn btn-primary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Account
