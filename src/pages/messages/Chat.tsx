import MiddleHeader from "@/shared/components/header/MiddleHeader"
import {KeyType, Sender, serializeChannelState} from "nostr-double-ratchet"
import {useEffect, useMemo, useState, useRef} from "react"
import {UserRow} from "@/shared/components/user/UserRow"
import {SortedMap} from "@/utils/SortedMap/SortedMap"
import {hexToBytes} from "@noble/hashes/utils"
import Message, {MessageType} from "./Message"
import {useParams} from "react-router-dom"
import {useLocalState} from "irisdb-hooks"
import MessageForm from "./MessageForm"
import {PublicKey} from "irisdb-nostr"
import {getChannel} from "./Channels"
import {localState} from "irisdb"
import { subscribeToAuthorDMNotifications } from "@/utils/notifications"

const comparator = (a: [string, MessageType], b: [string, MessageType]) =>
  a[1].time - b[1].time

const groupingThreshold = 60 * 1000 // 60 seconds = 1 minute

const groupMessages = (
  messages: SortedMap<string, MessageType>,
  timeThreshold: number = groupingThreshold
) => {
  const groups: MessageType[][] = []
  let currentGroup: MessageType[] = []
  let lastDate: string | null = null

  for (const [, message] of messages) {
    const messageDate = new Date(message.time).toDateString()

    if (lastDate !== messageDate) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup)
      }
      currentGroup = [message]
      lastDate = messageDate
    } else {
      if (currentGroup.length === 0) {
        currentGroup.push(message)
      } else {
        const lastMessage = currentGroup[currentGroup.length - 1]
        const timeDiff = message.time - lastMessage.time
        const isSameSender = message.sender === lastMessage.sender

        if (isSameSender && timeDiff <= timeThreshold) {
          currentGroup.push(message)
        } else {
          groups.push(currentGroup)
          currentGroup = [message]
        }
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
}

const Chat = () => {
  const {id} = useParams()
  const hexId = useMemo(() => id && new PublicKey(id).toString(), [id])
  const [messages, setMessages] = useState(
    new SortedMap<string, MessageType>([], comparator)
  )
  //const [myPubKey] = useLocalState("user/publicKey", "")
  const [ourRatchetPrivateKey] = useLocalState("user/privateKey", "")
  const [haveReply, setHaveReply] = useState(false)
  const [haveSent, setHaveSent] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const channel = useMemo(
    () =>
      (hexId &&
        ourRatchetPrivateKey &&
        getChannel(hexId, hexId, hexToBytes(ourRatchetPrivateKey))) ||
      undefined,
    [hexId, ourRatchetPrivateKey]
  )

  const saveState = () => {
    hexId &&
      channel &&
      localState
        .get("channels")
        .get(hexId)
        .get("state")
        .put(serializeChannelState(channel.state))
  }

  useEffect(() => {
    if (!(hexId && channel)) {
      return
    }
    setMessages(new SortedMap<string, MessageType>([], comparator))
    const unsub1 = localState
      .get("channels")
      .get(hexId)
      .get("messages")
      .forEach((message, path) => {
        const split = path.split("/")
        const id = split[split.length - 1]
        if (message && typeof message === "object" && message !== null) {
          if (!haveReply && (message as MessageType).sender !== "user") {
            setHaveReply(true)
          }
          if (!haveSent && (message as MessageType).sender === "user") {
            setHaveSent(true)
          }
          setMessages((prev) => {
            if (prev.has(id)) {
              return prev
            }
            const newMessages = new SortedMap(prev, comparator)
            newMessages.set(id as string, message as MessageType)
            return newMessages
          })
        }
      }, 2)

    const unsub2 = channel.onMessage((message) => {
      const msg: MessageType = {
        id: message.id,
        sender: hexId,
        content: message.data,
        time: message.time,
      }
      localState.get("channels").get(hexId).get("messages").get(message.id).put(msg)
      saveState()
      const current = channel.getNostrSenderKeypair(Sender.Them, KeyType.Current)
      const next = channel.getNostrSenderKeypair(Sender.Them, KeyType.Next)
      subscribeToAuthorDMNotifications([current.publicKey, next.publicKey])
    })

    return () => {
      unsub1()
      unsub2()
    }
  }, [channel])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView()
  }

  useEffect(() => {
    scrollToBottom()
  }, [])

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
    } else {
      setShowScrollDown(true)
    }
  }, [messages])

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const {scrollTop, scrollHeight, clientHeight} = chatContainerRef.current
      const isBottom = scrollTop + clientHeight >= scrollHeight - 10
      setIsAtBottom(isBottom)
      setShowScrollDown(!isBottom)
    }
  }

  const messageGroups = useMemo(() => groupMessages(messages), [messages])

  if (!hexId || !channel || !ourRatchetPrivateKey) {
    return null
  }

  return (
    <>
      <MiddleHeader>{id && <UserRow avatarWidth={32} pubKey={id} />}</MiddleHeader>
      <div
        ref={chatContainerRef}
        className="flex flex-col justify-end flex-1 overflow-y-auto space-y-4 p-4 relative"
        onScroll={handleScroll}
      >
        {/*}
        {haveSent && !haveReply && (
          <div className="flex flex-col items-center justify-center gap-4 h-full">
            <span className="text-lg font-semibold">No replies yet</span>
            <span className="text-sm text-base-content/70">
              Send them a link to this chat elsewhere
            </span>
            <QRCodeButton publicKey={myPubKey} />
          </div>
        )}
          */}
        {messageGroups.map((group, index) => {
          const groupDate = new Date(group[0].time).toDateString()
          const prevGroupDate =
            index > 0 ? new Date(messageGroups[index - 1][0].time).toDateString() : null

          return (
            <div key={index} className="mb-6">
              {(!prevGroupDate || groupDate !== prevGroupDate) && (
                <div className="text-xs text-base-content/50 text-center mb-4">
                  {groupDate}
                </div>
              )}
              <div className=" flex flex-col gap-[2px] ">
                {group.map((message, messageIndex) => (
                  <Message
                    key={message.id}
                    message={message}
                    isFirst={messageIndex === 0}
                    isLast={messageIndex === group.length - 1}
                  />
                ))}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      {showScrollDown && (
        <button
          className="btn btn-circle btn-primary fixed bottom-20 right-4"
          onClick={scrollToBottom}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
      <MessageForm channel={channel} id={hexId} onSubmit={saveState} />
    </>
  )
}

export default Chat
