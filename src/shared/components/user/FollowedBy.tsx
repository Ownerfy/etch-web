import {Fragment, useMemo} from "react"

import {AvatarGroup} from "./AvatarGroup"
import {nip19} from "nostr-tools"
import {Name} from "./Name"

import socialGraph from "@/utils/socialGraph"
import {Link} from "react-router-dom"
import {Badge} from "./Badge"

const MAX_FOLLOWED_BY_FRIENDS = 3

export default function FollowedBy({pubkey}: {pubkey: string}) {
  const followDistance = socialGraph().getFollowDistance(pubkey)
  const {followedByFriendsArray, totalFollowedByFriends} = useMemo(() => {
    const followedByFriends = socialGraph().followedByFriends(pubkey)
    return {
      followedByFriendsArray: Array.from(followedByFriends).slice(
        0,
        MAX_FOLLOWED_BY_FRIENDS
      ),
      totalFollowedByFriends: followedByFriends.size,
    }
  }, [pubkey, followDistance])

  const renderFollowedByFriendsLinks = () => {
    return followedByFriendsArray.map((a, index) => (
      <Fragment key={a}>
        <Link to={`/${nip19.npubEncode(a)}`} className="link inline">
          <Name pubKey={a} />
        </Link>
        {index < followedByFriendsArray.length - 1 && ","}{" "}
      </Fragment>
    ))
  }

  return (
    <div className="flex flex-row items-center gap-2 text-sm text-base-content/50">
      <Badge pubKeyHex={pubkey} />
      {!!followedByFriendsArray.length && (
        <div className="flex flex-row items-center">
          <AvatarGroup pubKeys={followedByFriendsArray} avatarWidth={20} />
        </div>
      )}
      {totalFollowedByFriends > 0 && (
        <div className="text-base-content/50">
          <span className="mr-1">Followed by</span>
          {renderFollowedByFriendsLinks()}
          {totalFollowedByFriends > MAX_FOLLOWED_BY_FRIENDS && (
            <span>
              and {totalFollowedByFriends - MAX_FOLLOWED_BY_FRIENDS} others you follow
            </span>
          )}
        </div>
      )}
      {followDistance === 1 && totalFollowedByFriends === 0 && (
        <div className="text-gray-light">Followed by you</div>
      )}
      {![1, 3].includes(followDistance) && totalFollowedByFriends < 1 && (
        <div className="text-gray-light">Not followed by anyone you follow</div>
      )}
      {followDistance === 3 && (
        <div className="text-gray-light">Followed by friends of friends</div>
      )}
    </div>
  )
}
