import {MOBILE_BREAKPOINT} from "@/shared/components/user/const.ts"
import React, {useState, useRef, useEffect} from "react"

export function useHoverCard(showHoverCard: boolean) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && !(event.target as HTMLElement).closest(".profile-card")) {
        closeCard()
        event.preventDefault()
        event.stopPropagation()
      }
    }

    if (isMobile && isOpen) {
      document.addEventListener("click", handleClickOutside, {capture: true})
    }
    return () => {
      document.removeEventListener("click", handleClickOutside, {capture: true})
    }
  }, [isOpen, isMobile])

  const toggleCard = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev)
    }
  }

  const closeCard = () => {
    setIsOpen(false)
  }

  const hoverProps = showHoverCard
    ? {
        onMouseEnter: () => {
          if (!isMobile) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => setIsOpen(true), 300)
          }
        },
        onMouseLeave: () => {
          if (!isMobile) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => setIsOpen(false), 300)
          }
        },
        onClick: (e: React.MouseEvent<HTMLDivElement>) => {
          if (isMobile) {
            e.preventDefault()
            e.stopPropagation()
            toggleCard()
          }
        },
      }
    : {}

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return {hoverProps, showCard: showHoverCard && isOpen, closeCard, isMobile}
}
