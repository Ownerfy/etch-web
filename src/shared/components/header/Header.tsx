import {useEffect, useRef, useState} from "react"
import {useLocation} from "react-router-dom"
import {RiMenuLine} from "@remixicon/react"

import NotificationButton from "@/shared/components/header/NotificationButton.tsx"
import {MOBILE_BREAKPOINT} from "@/shared/components/user/const.ts"
import {useLocalState} from "irisdb-hooks"

export default function Header() {
  const [myPubKey] = useLocalState("user/publicKey", "", String)

  const [, setShowLoginDialog] = useLocalState("home/showLoginDialog", false)

  const [isSidebarOpen, setSidebarOpen] = useLocalState("isSidebarOpen", false)

  const location = useLocation()
  let pageName = location.pathname.split("/")[1]

  if (pageName.startsWith("note")) {
    pageName = "note"
  } else if (pageName.startsWith("npub")) {
    pageName = "profile"
  }

  const mySetTitle = () => {
    setTitle(document.title.replace(` / ${CONFIG.appName}`, ""))
  }

  const [title, setTitle] = useState(document.title)
  useEffect(() => {
    const timeout1 = setTimeout(() => {
      mySetTitle()
    }, 0)
    const timeout2 = setTimeout(() => {
      mySetTitle()
    }, 100)
    const timeout3 = setTimeout(() => {
      mySetTitle()
    }, 1000)

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
    }
  }, [location])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false)
      }
    }

    const handleClick = () => {
      setSidebarOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(window.scrollY)

  useEffect(() => {
    const MIN_TRANSLATE_Y = -80
    const MAX_TRANSLATE_Y = 0
    const OPACITY_MIN_POINT = 30

    const handleScroll = () => {
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        return
      }
      const currentScrollY = window.scrollY
      let newTranslateY = 0
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        // bypass React's setState loop for smoother animation
        newTranslateY = Math.max(
          MIN_TRANSLATE_Y,
          parseFloat(
            headerRef
              .current!.style.transform.replace("translateY(", "")
              .replace("px)", "")
          ) -
            (currentScrollY - lastScrollY.current)
        )
      } else {
        // Scrolling up
        newTranslateY = Math.min(
          MAX_TRANSLATE_Y,
          parseFloat(
            headerRef
              .current!.style.transform.replace("translateY(", "")
              .replace("px)", "")
          ) +
            (lastScrollY.current - currentScrollY)
        )
      }
      lastScrollY.current = currentScrollY
      headerRef.current!.style.transform = `translateY(${newTranslateY}px)`
      contentRef.current!.style.opacity = `${1 - Math.min(1, newTranslateY / -OPACITY_MIN_POINT)}`
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header
        ref={headerRef}
        style={{transform: `translateY(0px)`}}
        className="md:hidden shadow-theme-xl mb-8 flex fixed top-0 left-0 right-0 bg-base-200 text-base-content p-2 z-30 select-none"
      >
        <div
          ref={contentRef}
          className="flex md:pl-20 xl:pl-40 justify-between items-center flex-1 max-w-screen-lg mx-auto"
        >
          <div className="flex items-center gap-2">
            <button
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation() // Prevent click from propagating to document
                setSidebarOpen(!isSidebarOpen)
              }}
              className="md:hidden btn btn-ghost btn-circle"
            >
              <RiMenuLine className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <h1
                className="text-lg text-base-content cursor-pointer"
                onClick={() => window.scrollTo(0, 0)}
              >
                {title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 mr-2">
            {myPubKey ? (
              <div className="md:hidden">
                <NotificationButton />
              </div>
            ) : (
              <button
                className="md:hidden btn btn-sm btn-primary"
                onClick={() => setShowLoginDialog(true)}
              >
                Sign up
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
