import {Link} from "react-router-dom"
import {nip19} from "nostr-tools"
import {useMemo} from "react"

import {useHoverCard} from "@/shared/components/user/useHoverCard"
import {Avatar} from "@/shared/components/user/Avatar"
import {Name} from "@/shared/components/user/Name"
import ProfileCard from "./ProfileCard"

const HEX_REGEX = /^[0-9a-fA-F]{64}$/

export function UserRow({
  pubKey,
  description,
  avatarWidth = 45,
  textClassName,
  linkToProfile = true,
  showBadge = true,
  showHoverCard = false,
}: {
  pubKey: string
  description?: string
  avatarWidth?: number
  textClassName?: string
  linkToProfile?: boolean
  showBadge?: boolean
  showHoverCard?: boolean
}) {
  const {hoverProps, showCard} = useHoverCard(showHoverCard)

  const content = (
    <div
      className="flex flex-row items-center gap-2 justify-between relative"
      {...hoverProps}
    >
      <div className="flex items-center gap-2 flex-row break-words [overflow-wrap:anywhere]">
        <Avatar
          pubKey={pubKey}
          showTooltip={false}
          showBadge={showBadge}
          width={avatarWidth}
        />
        <Name pubKey={pubKey} className={textClassName} />
      </div>
      <span className="text-base-content">{description}</span>
      <div
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        className={`cursor-default z-40 bg-base-100 rounded-2xl absolute left-0 top-full mt-2 w-96 min-h-32 p-4 transition-all duration-300 ease-in-out ${
          showCard ? "opacity-100" : "opacity-0 hidden"
        }`}
      >
        {showCard && (
          <ProfileCard pubKey={pubKey} showFollows={true} showHoverCard={false} />
        )}
      </div>
    </div>
  )

  const link = useMemo(() => {
    if (linkToProfile) {
      try {
        if (pubKey.startsWith("npub")) {
          return `/${pubKey}`
        } else if (HEX_REGEX.test(pubKey)) {
          const k = nip19.npubEncode(pubKey)
          return `/${k}`
        }
      } catch (error) {
        console.warn(error)
      }
    }
    return ""
  }, [linkToProfile, pubKey])

  return linkToProfile ? <Link to={link}>{content}</Link> : content
}
