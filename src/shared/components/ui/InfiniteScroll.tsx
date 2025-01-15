import {ReactNode, useCallback, useEffect, useRef} from "react"

type Props = {
  onLoadMore: () => void
  children: ReactNode
}

const InfiniteScroll = ({onLoadMore, children}: Props) => {
  const observerRef = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting) {
        onLoadMore()
      }
    },
    [onLoadMore]
  )

  useEffect(() => {
    const observerOptions = {
      rootMargin: "1000px",
      threshold: 1.0,
    }

    const observer = new IntersectionObserver(handleObserver, observerOptions)
    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [handleObserver])

  return (
    <>
      {children}
      <div ref={observerRef} />
    </>
  )
}

export default InfiniteScroll
