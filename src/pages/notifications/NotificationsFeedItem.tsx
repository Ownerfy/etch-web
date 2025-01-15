import EventBorderless from "@/shared/components/event/EventBorderless.tsx"

import RelativeTime from "@/shared/components/event/RelativeTime.tsx"
import {Avatar} from "@/shared/components/user/Avatar.tsx"
import HyperText from "@/shared/components/HyperText"
import {MouseEvent, useEffect, useState} from "react"
import {Notification} from "@/utils/notifications"
import {Link, useNavigate} from "react-router-dom"
import {getTag} from "@/utils/nostr"
import classNames from "classnames"
import {nip19} from "nostr-tools"

interface NotificationsFeedItemProps {
  notification: Notification
  highlight: boolean
}

function NotificationsFeedItem({notification, highlight}: NotificationsFeedItemProps) {
  const navigate = useNavigate()

  const [type, setType] = useState<string>()
  const [description, setDescription] = useState<string>()

  const handleNavigateToReplyEvent = (e: MouseEvent) => {
    if (e.target instanceof Element && e.target.closest("a")) {
      return
    }
    try {
      const noteAddr = nip19.noteEncode(
        notification.kind === 1 ? notification.id : notification.originalEventId
      )
      navigate(`/${noteAddr}`)
    } catch (error) {
      console.warn(error)
    }
  }

  useEffect(() => {
    const t = notification.tags ? getTag("type", notification.tags) : null
    if (t) setType(t)

    const desc = notification.tags ? getTag("desc", notification.tags) : null
    if (desc) setDescription(desc)
  }, [notification])

  if (!notification.originalEventId) return null

  return (
    <div
      className={classNames(
        "flex flex-col p-4 md:px-8 border-b border-custom transition-colors duration-300 cursor-pointer hover:bg-[var(--note-hover-color)]",
        {"bg-info/20": highlight}
      )}
      onClick={handleNavigateToReplyEvent}
    >
      <div className="flex items-center justify-between text-base-content/75">
        <div className="flex flex-row items-center flex-wrap">
          {Array.from(notification.users.entries())
            .reverse()
            .slice(0, 5)
            .map(([key]) => (
              <Link key={key} className="mr-2 inline" to={`/${nip19.npubEncode(key)}`}>
                <Avatar pubKey={key} width={30} showHoverCard={true} />
              </Link>
            ))}
          <span className="ml-1" />
          {notification.users.size > 5 && (
            <span className="inline font-bold">
              and {notification.users.size - 5} others
            </span>
          )}
          <span className="ml-1 font-bold">
            {" "}
            {/* TODO: get original post and say "to your post" it was yours */}
            {notification.kind === 1 && "replied"}
            {notification.kind === 7 && "reacted"}
            {notification.kind === 6 && "reposted"}
            {notification.kind === 9735 && "zapped"}
            {notification.kind === 6927 && type && description}
          </span>
        </div>
        <span className="text-base-content/50">
          <RelativeTime from={notification.time * 1000} />
        </span>
      </div>
      {notification.kind === 1 && (
        <p className="ml-8 rounded-lg mt-1 px-3 py-4 cursor-pointer">
          <HyperText>{notification.content}</HyperText>
        </p>
      )}
      {notification.kind !== 1 && (
        <div className="py-4 ml-10">
          <EventBorderless eventId={notification.originalEventId} contentOnly={true} />
        </div>
      )}
    </div>
  )
}

export default NotificationsFeedItem
