import {NDKEvent, NDKTag} from "@nostr-dev-kit/ndk"
import {ndk, PublicKey} from "irisdb-nostr"
import {useLocalState} from "irisdb-hooks"
import {useMemo, useState} from "react"

import socialGraph from "@/utils/socialGraph.ts"

export function FollowButton({pubKey, small = true}: {pubKey: string; small?: boolean}) {
  const [myPubKey] = useLocalState("user/publicKey", "", String)
  const [isHovering, setIsHovering] = useState(false)
  const [, setUpdated] = useState(0)
  const pubKeyHex = useMemo(() => {
    if (!pubKey) return null
    try {
      return new PublicKey(pubKey).toString()
    } catch (error) {
      console.error("Invalid public key:", pubKey, error)
      return null
    }
  }, [pubKey])
  const isFollowing =
    myPubKey && pubKeyHex && socialGraph().isFollowing(myPubKey, pubKeyHex)

  if (!myPubKey || !pubKeyHex || pubKeyHex === myPubKey) {
    return null
  }

  const handleClick = () => {
    const event = new NDKEvent(ndk())
    event.kind = 3
    const followedUsers = socialGraph().getFollowedByUser(myPubKey)
    if (isFollowing) {
      followedUsers.delete(pubKeyHex)
    } else {
      followedUsers.add(pubKeyHex)
    }
    event.tags = Array.from(followedUsers).map((pubKey) => ["p", pubKey]) as NDKTag[]
    event.publish().catch((e) => console.warn("Error publishing follow event:", e))
    setTimeout(() => {
      setUpdated((updated) => updated + 1)
    }, 1000)
  }

  // text should be Follow or Following. if Following, on hover it should say Unfollow
  let text = "Follow"
  let className = "btn-primary"
  if (isFollowing) {
    text = isHovering ? "Unfollow" : "Following"
    className = isHovering ? "btn-secondary" : "btn-success"
  }

  return (
    <button
      className={`btn ${small ? "btn-sm" : ""} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {text}
    </button>
  )
}
