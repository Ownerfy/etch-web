import SimpleFeedItemDropdown from "@/shared/components/event/SimpleFeedItemDropdown.tsx"
import {MouseEvent as ReactMouseEvent} from "react"
import classNames from "classnames"
import {nip19} from "nostr-tools"

type FeedItemPlaceholderProps = {
  standalone?: boolean
  asEmbed: boolean
  eventIdHex: string
  onClick: (e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => void
}

const FeedItemPlaceholder = ({
  standalone,
  asEmbed,
  eventIdHex,
  onClick,
}: FeedItemPlaceholderProps) => {
  return (
    <div
      className={classNames("flex flex-col gap-4 pt-2 px-4 pb-0 border-custom", {
        "cursor-pointer": !standalone,
        "my-2 min-h-[96px] border pt-3 pb-3 rounded": asEmbed,
        "min-h-[135px]": !asEmbed,
      })}
      onClick={onClick}
    >
      <div className="flex flex-row gap-4 flex-1">
        <div className="flex flex-1 w-full flex-row justify-between items-center">
          <div className="animate-pulse bg-neutral h-4 w-1/4 rounded-lg" />
          <SimpleFeedItemDropdown eventId={nip19.noteEncode(eventIdHex)} />
        </div>
      </div>
    </div>
  )
}

export default FeedItemPlaceholder
