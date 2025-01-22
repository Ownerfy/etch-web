import {useEffect, useRef, useState} from "react"
import classNames from "classnames"
import {localState} from "irisdb"
import Hls from "hls.js"

import {NDKEvent} from "@nostr-dev-kit/ndk"

interface HlsVideoComponentProps {
  match: string
  event: NDKEvent | undefined
}

function HlsVideoComponent({match, event}: HlsVideoComponentProps) {
  let blurNSFW = true
  localState.get("settings/blurNSFW").on((value) => {
    if (typeof value === "boolean") {
      blurNSFW = value
    }
  })

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [blur, setBlur] = useState(
    blurNSFW &&
      (!!event?.content.toLowerCase().includes("#nsfw") ||
        event?.tags.some((t) => t[0] === "content-warning"))
  )

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls()
      hls.loadSource(match)
      hls.attachMedia(videoRef.current)
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = match
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        videoRef.current?.play()
      } else {
        videoRef.current?.pause()
      }
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.33,
    })

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [match])

  const onClick = () => {
    if (blur) {
      setBlur(false)
    }
  }

  return (
    <div className="relative w-full object-contain my-2">
      {/* <video TODO: bring this back when proxy server is up
        onClick={onClick}
        ref={videoRef}
        className={classNames("rounded max-h-[70vh] w-auto", {"blur-xl": blur})}
        controls
        muted
        autoPlay
        playsInline
        loop
        poster={`https://imgproxy.etch.social/thumbnail/638/${match}`}
      ></video> */}
      <video
        onClick={onClick}
        ref={videoRef}
        className={classNames("rounded max-h-[70vh] w-auto", {"blur-xl": blur})}
        controls
        muted
        autoPlay
        playsInline
        loop
      ></video>
    </div>
  )
}

export default HlsVideoComponent
