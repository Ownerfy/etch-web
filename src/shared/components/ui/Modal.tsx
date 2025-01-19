import {ReactNode, useEffect, useRef, useState} from "react"
import Icon from "../Icons/Icon"

type ModalProps = {
  onClose: () => void
  children: ReactNode
  hasBackground?: boolean
}

const Modal = ({onClose, children, hasBackground = true}: ModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isMouseDownOnBackdrop, setIsMouseDownOnBackdrop] = useState(false)

  const showModal = () => {
    modalRef.current?.show()
  }

  const closeModal = () => {
    modalRef.current?.close()
    onClose?.()
  }

  useEffect(() => {
    showModal()

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // prevent daisyUI default
        e.preventDefault()
        onClose()
        closeModal()
      }
    }

    document.addEventListener("keydown", handleEscapeKey)

    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && e.target === modalRef.current) {
        setIsMouseDownOnBackdrop(true)
        e.preventDefault()
      } else {
        setIsMouseDownOnBackdrop(false)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (isMouseDownOnBackdrop && modalRef.current && e.target === modalRef.current) {
        e.preventDefault()
        e.stopPropagation()
        onClose()
        closeModal()
      }
      setIsMouseDownOnBackdrop(false)
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      closeModal()
      document.removeEventListener("keydown", handleEscapeKey)
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isMouseDownOnBackdrop])

  return (
    <dialog ref={modalRef} className="modal outline-none z-[500]">
      <div
        ref={contentRef}
        className={hasBackground ? "modal-box w-full max-w-full" : ""}
        onClick={(e) => e.stopPropagation()}
      >
        {hasBackground && (
          <button
            className="btn btn-circle btn-ghost absolute z-50 right-2 top-2 focus:outline-none"
            onClick={() => {
              onClose()
              closeModal()
            }}
          >
            <Icon name="close" size={12} />
          </button>
        )}
        {children}
      </div>
      {hasBackground && (
        <div
          className="modal-backdrop"
          onClick={() => {
            onClose()
            closeModal()
          }}
        />
      )}
    </dialog>
  )
}

export default Modal
