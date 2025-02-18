import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie"
import {ndk, privateKeyLogin} from "irisdb-nostr"
import {RouterProvider} from "react-router-dom"
import ReactDOM from "react-dom/client"
import {localState} from "irisdb"
import {router} from "@/pages"
import "@/index.css"

try {
  const sessions = localStorage.getItem("sessions")
  if (sessions) {
    const data = JSON.parse(sessions)
    const key = data.length && data[0].privateKeyData?.raw
    if (key) {
      privateKeyLogin(key)
    }
  }
} catch (e) {
  console.error("login with Snort private key failed", e)
}

try {
  const DEFAULT_RELAYS = [
    "wss://relay.etch.social",
    "wss://relay.damus.io",
    "wss://relay.nostr.band",
    "wss://relay.snort.social",
    "wss://strfry.iris.to",
  ]

  // If the user is logged in this is the first place NDK is initialized
  // If not it's initialized in NotificationsFeed.tsx
  ndk({
    explicitRelayUrls: DEFAULT_RELAYS,
    cacheAdapter: new NDKCacheAdapterDexie({dbName: "irisdb-nostr"}) as any,
  })
} catch (e) {
  ndk() // init NDK & irisdb login flow
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
)

document.title = CONFIG.appName
document.documentElement.setAttribute("data-theme", CONFIG.defaultTheme)

localState.get("user/theme").on((theme) => {
  if (typeof theme === "string") {
    document.documentElement.setAttribute("data-theme", theme)
  }
})
