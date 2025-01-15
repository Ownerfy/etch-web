import {FollowButton} from "@/shared/components/button/FollowButton"
import {ProfileAbout} from "@/shared/components/user/ProfileAbout"
import {UserRow} from "@/shared/components/user/UserRow"
import FollowedBy from "./FollowedBy"

const ProfileCard = ({
  pubKey,
  showAbout = true,
  showFollows = false,
  showHoverCard = false,
}: {
  pubKey: string
  showAbout?: boolean
  showFollows?: boolean
  showHoverCard?: boolean
}) => {
  return (
    <div className="flex flex-col font-normal text-base gap-2 profile-card">
      <div className="flex flex-row items-center justify-between gap-2">
        <UserRow pubKey={pubKey} showHoverCard={showHoverCard} />
        <FollowButton pubKey={pubKey} />
      </div>
      {showAbout && <ProfileAbout pubKey={pubKey} className="mb-2" />}
      {showFollows && <FollowedBy pubkey={pubKey} />}
    </div>
  )
}

export default ProfileCard
