import {RiArrowLeftSLine, RiArrowRightSLine} from "@remixicon/react"
import PreloadImages from "@/shared/components/media/PreloadImages"
import {useEffect, useState, MouseEvent, useCallback} from "react"
import MediaModal from "@/shared/components/media/MediaModal"
import ImageComponent from "./ImageComponent"
import {useSwipeable} from "react-swipeable"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {localState} from "irisdb"

interface CarouselProps {
  images: string[]
  event?: NDKEvent
}

let blurNSFW = true

localState.get("settings/blurNSFW").once((value) => {
  if (typeof value === "boolean") {
    blurNSFW = value
  }
})

function Carousel({images, event}: CarouselProps) {
  const CarouselButton = ({
    direction,
    onClick,
  }: {
    direction: "left" | "right"
    onClick: (e: MouseEvent<HTMLButtonElement>) => void
  }) => (
    <button
      onClick={(e) => onClick(e as MouseEvent<HTMLButtonElement>)}
      className={`absolute top-1/2 ${direction === "left" ? "left-0" : "right-0"} transform -translate-y-1/2 bg-gray-800 rounded-full opacity-50 text-white p-2`}
    >
      {direction === "left" ? (
        <RiArrowLeftSLine size={24} />
      ) : (
        <RiArrowRightSLine size={24} />
      )}
    </button>
  )

  const ImageIndicators = ({
    images,
    currentIndex,
  }: {
    images: string[]
    currentIndex: number
  }) => (
    <div className="flex space-x-2 mt-2">
      {images.map((_, index) => (
        <span
          key={index}
          className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-primary" : "bg-gray-300"}`}
        />
      ))}
    </div>
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [blur, setBlur] = useState(
    blurNSFW &&
      (!!event?.content.toLowerCase().includes("#nsfw") ||
        event?.tags.some((t) => t[0] === "content-warning"))
  )
  const [showModal, setShowModal] = useState(false)

  const nextImage = (e?: MouseEvent | KeyboardEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = (e?: MouseEvent | KeyboardEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const onClickImage = () => {
    if (blur) {
      setBlur(false)
    } else {
      setShowModal(true)
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextImage(e)
      } else if (e.key === "ArrowLeft") {
        prevImage(e)
      }
    }

    if (showModal) {
      window.addEventListener("keydown", handleKeyDown)
    } else {
      window.removeEventListener("keydown", handleKeyDown)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [showModal])

  const onCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  return (
    <div
      {...handlers} // Add swipe handlers here
      className={`relative w-full h-96 max-h-screen my-2 flex flex-col items-${images.length > 1 ? "center" : "start"}`}
    >
      <ImageComponent
        match={images[currentIndex]}
        index={currentIndex}
        onClickImage={onClickImage}
        blur={blur}
      />
      {images.length > 1 && (
        <>
          <CarouselButton direction="left" onClick={prevImage} />
          <CarouselButton direction="right" onClick={nextImage} />
          <ImageIndicators images={images} currentIndex={currentIndex} />
          <PreloadImages images={images} currentIndex={currentIndex} size={600} />
        </>
      )}
      {showModal && (
        <>
          <MediaModal
            onClose={onCloseModal}
            onPrev={images.length > 1 ? prevImage : undefined}
            onNext={images.length > 1 ? nextImage : undefined}
            mediaUrl={images[currentIndex]}
            mediaType="image"
            currentIndex={images.length > 1 ? currentIndex : undefined}
            totalCount={images.length > 1 ? images.length : undefined}
          />
          <PreloadImages images={images} currentIndex={currentIndex} />
        </>
      )}
    </div>
  )
}

export default Carousel
