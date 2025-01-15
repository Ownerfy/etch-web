import classNames from "classnames"

export type MessageType = {
  id: string
  sender: string
  content: string
  time: number
}

type MessageProps = {
  message: MessageType
  isFirst: boolean
  isLast: boolean
}

const Message = ({message, isFirst, isLast}: MessageProps) => {
  const isUser = message.sender === "user"

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "numeric",
      hour12: undefined, // This will use the locale's preference for 12/24 hour time
    }).format(date)
  }

  return (
    <div
      className={classNames(
        "max-w-[85%] md:max-w-[70%]",
        isUser ? "ml-auto" : "mr-auto",
        isUser ? "bg-primary text-primary-content" : "bg-neutral text-neutral-content",
        isFirst && isLast && "rounded-2xl",
        isFirst &&
          !isLast &&
          (isUser
            ? "rounded-t-2xl rounded-bl-2xl rounded-br-sm"
            : "rounded-t-2xl rounded-br-2xl rounded-bl-sm"),
        !isFirst &&
          isLast &&
          (isUser
            ? "rounded-b-2xl rounded-tl-2xl rounded-tr-sm"
            : "rounded-b-2xl rounded-tr-2xl rounded-tl-sm"),
        !isFirst &&
          !isLast &&
          (isUser ? "rounded-l-2xl rounded-r-sm" : "rounded-r-2xl rounded-l-sm")
      )}
    >
      <div
        className={classNames("px-3 py-2", isLast && "flex justify-between items-end")}
      >
        <p className="text-sm">{message.content}</p>
        {isLast && (
          <p className="text-xs opacity-50 ml-2 whitespace-nowrap">
            {message.time && formatTime(message.time)}
          </p>
        )}
      </div>
    </div>
  )
}

export default Message
