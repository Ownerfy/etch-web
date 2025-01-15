import socialGraph from "@/utils/socialGraph.ts"
import {RiCheckLine} from "@remixicon/react"
import {localState} from "irisdb"

let loggedIn = false
localState.get("user/publicKey").on((v?: string) => (loggedIn = !!v))

export const Badge = ({
  pubKeyHex,
  className,
}: {
  pubKeyHex: string
  className?: string
}) => {
  if (!loggedIn) {
    return null
  }
  const distance = socialGraph().getFollowDistance(pubKeyHex)
  if (distance <= 2) {
    let tooltip
    let badgeClass
    if (distance === 0) {
      tooltip = "You"
      badgeClass = "bg-primary"
    } else if (distance === 1) {
      tooltip = "Following"
      badgeClass = "bg-primary"
    } else if (distance === 2) {
      const followedByFriends = socialGraph().followedByFriends(pubKeyHex)
      tooltip = `Followed by ${followedByFriends.size} friends`
      badgeClass = followedByFriends.size > 10 ? "bg-accent" : "bg-neutral"
    }
    return (
      <span
        className={`rounded-full aspect-square p-[2px] text-white ${badgeClass} ${className}`}
        title={tooltip}
      >
        <RiCheckLine size={12} />
      </span>
    )
  }
  return null
}
