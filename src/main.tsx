import "@/index.css"

import {ndk, privateKeyLogin} from "irisdb-nostr"
import {RouterProvider} from "react-router-dom"
import ReactDOM from "react-dom/client"
import {localState} from "irisdb"

import {router} from "@/pages"

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

ndk() // init NDK & irisdb login flow

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
