import {FormEvent, useState, useEffect, useRef} from "react"
import {NDKEventFromRawEvent} from "@/utils/nostr"
import Icon from "@/shared/components/Icons/Icon"
import {Channel} from "nostr-double-ratchet"
import {MessageType} from "./Message"
import {localState} from "irisdb"

interface MessageFormProps {
  channel: Channel
  id: string
  onSubmit: () => void
}

const MessageForm = ({channel, id, onSubmit}: MessageFormProps) => {
  const [newMessage, setNewMessage] = useState("")
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
    }

    checkTouchDevice()
    window.addEventListener("touchstart", checkTouchDevice)

    return () => {
      window.removeEventListener("touchstart", checkTouchDevice)
    }
  }, [])

  useEffect(() => {
    if (!isTouchDevice && inputRef.current) {
      inputRef.current.focus()
    }
  }, [id, isTouchDevice])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const text = newMessage.trim()
    if (text) {
      const time = Date.now()
      const event = channel.send(text)
      const ndkEvent = NDKEventFromRawEvent(event)
      ndkEvent.publish().catch((e) => console.warn("Error publishing event:", e))
      const message: MessageType = {
        id: event.id,
        sender: "user",
        content: text,
        time,
      }
      localState.get("channels").get(id).get("messages").get(event.id).put(message)
      setNewMessage("")
    }
    onSubmit()
  }

  return (
    <footer className="p-4 border-t border-custom sticky bottom-0 bg-base-200">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message"
          className="flex-1 input input-sm md:input-md input-bordered"
        />
        <button
          type="submit"
          className={`btn btn-primary btn-circle btn-sm md:btn-md ${isTouchDevice ? "" : "hidden"}`}
        >
          <Icon name="arrow-right" className="-rotate-90" />
        </button>
      </form>
    </footer>
  )
}

export default MessageForm
