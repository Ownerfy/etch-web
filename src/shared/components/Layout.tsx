import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom"
import ForgotPasswordDialog from "@/shared/components/user/ForgotPassword.tsx"
import WelcomeDialog from "@/shared/components/user/WelcomeDialog.tsx"
import NoteCreator from "@/shared/components/create/NoteCreator.tsx"
import {useInviteLinkFromUrl} from "../hooks/useInviteLinkFromUrl"
import LoginDialog from "@/shared/components/user/LoginDialog"
import NavSideBar from "@/shared/components/NavSideBar.tsx"
import Header from "@/shared/components/header/Header.tsx"
import {socialGraphLoaded} from "@/utils/socialGraph"
import Modal from "@/shared/components/ui/Modal.tsx"
import Footer from "@/shared/components/Footer.tsx"
import {auth} from "@/shared/services/firebase.tsx"
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
  const [showWelcomeDialog, setShowWelcomeDialog] = useLocalState(
    "home/showWelcomeDialog",
    false
  )
  const [showLoginAccountDialog, setShowLoginAccountDialog] = useLocalState(
    "home/showLoginAccountDialog",
    false
  )
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useLocalState(
    "home/showForgotPasswordDialog",
    false
  )
  const [isSocialGraphLoaded, setIsSocialGraphLoaded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Add new useLocalState hooks for Bluesky data
  const [, setBskyToken] = useLocalState("bsky/token", "")
  const [, setBskyDid] = useLocalState("bsky/did", "")
  const [, setBskyHandle] = useLocalState("bsky/handle", "")
  const [, setBskyDescription] = useLocalState("bsky/description", "")
  const [, setBskyAvatar] = useLocalState("bsky/avatar", "")

  // if user is not logged in show login dialog
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        setShowLoginDialog(true)
      }
    })
  }, [])

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

  // Add effect to handle Bluesky OAuth callback
  useEffect(() => {
    const bskyParams = ["token", "did", "handle", "description", "avatar"]
    const hasAnyBskyParam = bskyParams.some((param) => searchParams.has(param))

    if (hasAnyBskyParam) {
      setBskyToken(searchParams.get("token") || "")
      setBskyDid(searchParams.get("did") || "")
      setBskyHandle(searchParams.get("handle") || "")
      setBskyDescription(searchParams.get("description") || "")
      setBskyAvatar(searchParams.get("avatar") || "")

      // Clear the URL parameters after storing them
      // navigate(location.pathname, {replace: true})
    }
  }, [searchParams, navigate, location.pathname])

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
        {showLoginAccountDialog && (
          <Modal onClose={() => setShowLoginAccountDialog(false)}>
            <LoginDialog defaultToSignIn={true} />
          </Modal>
        )}
        {showLoginDialog && (
          <Modal onClose={() => setShowLoginDialog(false)}>
            <LoginDialog />
          </Modal>
        )}
        {showWelcomeDialog && (
          <Modal onClose={() => setShowWelcomeDialog(false)}>
            <WelcomeDialog />
          </Modal>
        )}
        {showForgotPasswordDialog && (
          <Modal
            onClose={() => {
              setShowLoginDialog(true)
              setShowForgotPasswordDialog(false)
            }}
          >
            <ForgotPasswordDialog />
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
