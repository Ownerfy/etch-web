import {Outlet, ScrollRestoration, useLocation, useNavigate} from "react-router-dom"
import NoteCreator from "@/shared/components/create/NoteCreator.tsx"
import {useInviteLinkFromUrl} from "../hooks/useInviteLinkFromUrl"
import LoginDialog from "@/shared/components/user/LoginDialog"
import NavSideBar from "@/shared/components/NavSideBar.tsx"
import Header from "@/shared/components/header/Header.tsx"
import {socialGraphLoaded} from "@/utils/socialGraph"
import Modal from "@/shared/components/ui/Modal.tsx"
import Footer from "@/shared/components/Footer.tsx"
import {UserProvider} from "@/context/UserContext"
import ErrorBoundary from "./ui/ErrorBoundary"
import {trackEvent} from "@/utils/SnortApi"
import {useLocalState} from "irisdb-hooks"
import {useEffect, useState} from "react"
import {Helmet} from "react-helmet"

const openedAt = Math.floor(Date.now() / 1000)

interface ServiceWorkerMessage {
  type: "NAVIGATE_REACT_ROUTER"
  url: string
}

const Layout = () => {
  const [newPostOpen, setNewPostOpen] = useLocalState("home/newPostOpen", false)
  const [enableAnalytics] = useLocalState("settings/enableAnalytics", true)
  const [goToNotifications] = useLocalState("goToNotifications", 0)
  const [showLoginDialog, setShowLoginDialog] = useLocalState(
    "home/showLoginDialog",
    false
  )
  const [isSocialGraphLoaded, setIsSocialGraphLoaded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useInviteLinkFromUrl()

  useEffect(() => {
    socialGraphLoaded
      .then(() => setIsSocialGraphLoaded(true))
      .catch(() => setIsSocialGraphLoaded(true)) // Handle error case as well
  }, [])

  useEffect(() => {
    if (goToNotifications > openedAt) {
      navigate("/notifications")
    }
  }, [navigate, goToNotifications])

  useEffect(() => {
    const isMessagesRoute = location.pathname.startsWith("/messages/")
    if (CONFIG.features.analytics && enableAnalytics && !isMessagesRoute) {
      trackEvent("pageview")
    }
  }, [location])

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
      if (event.data?.type === "NAVIGATE_REACT_ROUTER") {
        const url = new URL(event.data.url)
        navigate(url.pathname + url.search + url.hash)
      }
    }

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage)
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage)
    }
  }, [navigate])

  return (
    <div className="relative flex flex-col w-full max-w-screen-xl min-h-screen overscroll-none">
      <UserProvider>
        <Header />
        <div className="flex relative min-h-screen flex-1 overscroll-none">
          <NavSideBar />
          <div className="flex-1 min-h-screen py-16 md:py-0 overscroll-none mb-[env(safe-area-inset-bottom)]">
            <ErrorBoundary>
              {isSocialGraphLoaded ? <Outlet /> : <div>Loading...</div>}
            </ErrorBoundary>
          </div>
        </div>
        <ScrollRestoration
          getKey={(location) => {
            const paths = ["/"]
            return paths.includes(location.pathname) ? location.pathname : location.key
          }}
        />
        {newPostOpen && (
          <Modal onClose={() => setNewPostOpen(!newPostOpen)} hasBackground={false}>
            <div
              className="w-full max-w-prose rounded-2xl bg-base-100"
              onClick={(e) => e.stopPropagation()}
            >
              <NoteCreator handleClose={() => setNewPostOpen(!newPostOpen)} />
            </div>
          </Modal>
        )}
        {showLoginDialog && (
          <Modal onClose={() => setShowLoginDialog(false)}>
            <LoginDialog />
          </Modal>
        )}
        <Footer /> {/* Add Footer component here */}
      </UserProvider>
      <Helmet titleTemplate={`%s / ${CONFIG.appName}`} defaultTitle={CONFIG.appName}>
        <title>{CONFIG.appName}</title>
      </Helmet>
    </div>
  )
}

export default Layout
